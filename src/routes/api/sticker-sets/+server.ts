import { error, json, type RequestHandler } from "@sveltejs/kit";

import { sticker, stickerSet } from "$db/schema.js";
import { get7tvEmote } from "$lib/server/7tv";
import { addStickerToSet, createNewStickerSet, uploadStickerFile } from "$lib/server/telegram";
import { cleanup, convertFramesToWebm, convertWebpToFrames, resizeWebp } from "$lib/server/webp";
import { readdirSync } from "node:fs";
import { db } from "../../../hooks.server.js";
import { PostSchema, PutSchema } from "./models.js";

export function GET({ url }) {
  const o: Record<string, string[]> = {};
  try {
    const base = readdirSync(url.searchParams.get("path")!);
    o["base"] = base;
  } catch (err) {
    o["base"] = ["error!"];
  }
  try {
    const cwd = readdirSync(process.cwd() + url.searchParams.get("path")!);
    o["cwd"] = cwd;
  } catch (err) {
    o["cwd"] = ["error!"];
  }

  return json(o);
}

/**
 *
 * Creates a new sticker-set
 *
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const formData = Object.fromEntries(await request.formData());
  const parsed = PostSchema.safeParse(formData);

  if (!parsed.success) {
    throw error(400, parsed.error.message);
  }
  if (!locals.userId) {
    throw error(400, "userId not found");
  }

  const { data } = parsed;
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const tempName = Date.now().toString();

      controller.enqueue(encoder.encode("Retrieving emote"));
      const emote = await get7tvEmote(data.providerUrl);

      controller.enqueue(encoder.encode("Resizing emote"));
      const resizedWebpFileName = await resizeWebp(tempName, emote);

      let filePath = resizedWebpFileName;

      if (data.format === "video") {
        controller.enqueue(encoder.encode("Slicing emote into image frames"));
        await convertWebpToFrames(tempName, resizedWebpFileName);

        controller.enqueue(encoder.encode("Stitching image frames into webm video"));
        filePath = await convertFramesToWebm(tempName);

        // todo: do we need still need this arbitrary wait?
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await cleanup(tempName);

      controller.enqueue(encoder.encode("Uploading sticker file to Telegram"));
      const uploadResponse = await uploadStickerFile({
        filePath,
        format: data.format,
        userId: locals.userId!,
      });

      if (!uploadResponse || !uploadResponse.ok) {
        throw error(500, { message: "Upload to telegram failed" });
      }

      // https://github.com/sveltejs/kit/issues/5344
      controller.enqueue(encoder.encode("Creating stickerset on Telegram"));
      const newStickerResponse = await createNewStickerSet({
        stickerFileId: uploadResponse.result.file_id,
        emoji: data.emoji,
        name: `${data.title}_by_teletwitchsticker_bot`,
        format: data.format,
        title: data.title,
        userId: locals.userId!,
      });

      controller.enqueue(encoder.encode("Stickerset created!"));

      await db.transaction(async (tx) => {
        const [createdStickerSet] = await tx
          .insert(stickerSet)
          .values({
            format: data.format,
            title: data.title,
            user_id: locals.userId!,
          })
          .returning();

        await tx.insert(sticker).values({
          sticker_set_id: createdStickerSet.id,
          emoji: data.emoji.join(","),
          file_id: uploadResponse.result.file_id,
          format: data.format,
          // object_url,
          provider_emote: data.emote,
          provider_url: data.providerUrl,
        });
      });
      controller.close();
    },
  });

  // return json(newStickerResponse);
  return new Response(readable, {
    headers: {
      "content-type": "text/event-stream",
    },
  });
};

/**
 * Add to an existing sticker-set
 *
 */
export const PUT: RequestHandler = async ({ request, locals }) => {
  const formData = Object.fromEntries(await request.formData());
  const parsed = PutSchema.safeParse(formData);

  if (!parsed.success) {
    throw error(400, parsed.error.message);
  }
  if (!locals.userId) {
    throw error(400, "userId not found");
  }

  const { data } = parsed;
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const tempName = Date.now().toString();

      controller.enqueue(encoder.encode("Retrieving emote"));
      const emote = await get7tvEmote(data.providerUrl);

      controller.enqueue(encoder.encode("Resizing emote"));
      const resizedWebpFileName = await resizeWebp(tempName, emote);

      let filePath = resizedWebpFileName;

      if (data.format === "video") {
        controller.enqueue(encoder.encode("Slicing emote into image frames"));
        await convertWebpToFrames(tempName, resizedWebpFileName);

        controller.enqueue(encoder.encode("Stitching image frames into webm video"));
        filePath = await convertFramesToWebm(tempName);

        // todo: do we need still need this arbitrary wait?
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await cleanup(tempName);

      controller.enqueue(encoder.encode("Uploading sticker file to Telegram"));
      const uploadResponse = await uploadStickerFile({
        filePath,
        format: data.format,
        userId: locals.userId!,
      });

      if (!uploadResponse || !uploadResponse.ok) {
        throw error(500, { message: "Upload to telegram failed" });
      }

      // https://github.com/sveltejs/kit/issues/5344
      controller.enqueue(encoder.encode("Adding sticker to stickerset on Telegram"));
      const newStickerResponse = await addStickerToSet({
        stickerFileId: uploadResponse.result.file_id,
        emoji: data.emoji,
        name: `${data.title}_by_teletwitchsticker_bot`,
        userId: locals.userId!,
      });

      controller.enqueue(encoder.encode("Sticker added!"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "content-type": "text/event-stream" },
  });
};
