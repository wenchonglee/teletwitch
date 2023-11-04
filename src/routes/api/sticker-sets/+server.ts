import { error, json, type RequestHandler } from "@sveltejs/kit";

import { sticker, stickerSet } from "$db/schema.js";
import { get7tvEmote } from "$lib/server/7tv";
import { addStickerToSet, createNewStickerSet, uploadStickerFile } from "$lib/server/telegram";
import { cleanup, convertFramesToWebm, convertWebpToFrames, mkTmpdir, resizeWebp } from "$lib/server/webp";
import { and, eq } from "drizzle-orm";
import { db } from "../../../hooks.server.js";
import { PostSchema, PutSchema } from "./models.js";

export const GET: RequestHandler = async () => {
  const stickers = await db.select().from(sticker);

  return json(stickers);
};

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
      const epoch = Date.now().toString();
      mkTmpdir(epoch);

      controller.enqueue(encoder.encode("Retrieving emote"));
      const emote = await get7tvEmote(data.providerUrl);

      controller.enqueue(encoder.encode("Resizing emote"));
      const resizedWebpFileName = await resizeWebp(epoch, emote);

      let filePath = resizedWebpFileName;

      if (data.format === "video") {
        controller.enqueue(encoder.encode("Slicing emote into image frames"));
        await convertWebpToFrames(epoch, resizedWebpFileName);

        controller.enqueue(encoder.encode("Stitching image frames into webm video"));
        filePath = await convertFramesToWebm(epoch);

        // todo: do we need still need this arbitrary wait?
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      controller.enqueue(encoder.encode("Uploading sticker file to Telegram"));
      const uploadResponse = await uploadStickerFile({
        filePath,
        format: data.format,
        userId: locals.userId!,
      });
      await cleanup(epoch);

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

  return new Response(readable, {
    headers: { "content-type": "text/event-stream" },
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
      const epoch = Date.now().toString();
      mkTmpdir(epoch);

      controller.enqueue(encoder.encode("Retrieving emote"));
      const emote = await get7tvEmote(data.providerUrl);

      controller.enqueue(encoder.encode("Resizing emote"));
      const resizedWebpFileName = await resizeWebp(epoch, emote);

      let filePath = resizedWebpFileName;

      if (data.format === "video") {
        controller.enqueue(encoder.encode("Slicing emote into image frames"));
        await convertWebpToFrames(epoch, resizedWebpFileName);

        controller.enqueue(encoder.encode("Stitching image frames into webm video"));
        filePath = await convertFramesToWebm(epoch);

        // todo: do we need still need this arbitrary wait?
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      controller.enqueue(encoder.encode("Uploading sticker file to Telegram"));
      const uploadResponse = await uploadStickerFile({
        filePath,
        format: data.format,
        userId: locals.userId!,
      });
      await cleanup(epoch);

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
      await db.transaction(async (tx) => {
        const [existingStickerSet] = await tx
          .select()
          .from(stickerSet)
          .where(and(eq(stickerSet.title, data.title), eq(stickerSet.user_id, locals.userId!)))
          .limit(1);

        await tx.insert(sticker).values({
          sticker_set_id: existingStickerSet.id,
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

  return new Response(readable, {
    headers: { "content-type": "text/event-stream" },
  });
};
