import { error, json, type RequestHandler } from "@sveltejs/kit";

import { objectStore, sticker, stickerSet } from "$db/schema.js";
import { get7tvEmote } from "$lib/server/7tv";
import { createNewStickerSet, uploadStickerFile } from "$lib/server/telegram";
import { cleanup, convertFramesToWebm, convertWebpToFrames, mkTmpdir, resizeWebp } from "$lib/server/webp";
import { customAlphabet } from "nanoid";
import { createReadStream } from "node:fs";
import { bucket, db } from "../../../hooks.server.js";
import { PostSchema } from "./models.js";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

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
      /**
       *
       * Process the image
       *
       */
      const epoch = Date.now().toString();
      mkTmpdir(epoch);

      controller.enqueue(encoder.encode("Retrieving and resizing emote"));
      const emote = await get7tvEmote(data.providerUrl);
      let filePath = await resizeWebp(epoch, emote);

      if (data.format === "video") {
        controller.enqueue(encoder.encode("Slicing emote into image frames"));
        await convertWebpToFrames(epoch, filePath);

        controller.enqueue(encoder.encode("Stitching image frames into webm video"));
        filePath = await convertFramesToWebm(epoch);

        // todo: do we need still need this arbitrary wait?
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      /**
       *
       * Upload image to supabase & insert to table
       *
       */
      const stream = createReadStream(filePath);
      const objectPath = `${nanoid()}.${data.format === "video" ? "webm" : "webp"}`;
      const uploadedFile = await bucket.upload(objectPath, stream, {
        cacheControl: "31536000",
        duplex: "half",
        contentType: data.format === "video" ? "video/webm" : "image/webp",
      });
      // todo: handle upload errors

      await db.insert(objectStore).values({
        file_path: objectPath,
        format: data.format,
        provider_emote: data.emote,
        provider_url: data.providerUrl,
      });

      /**
       *
       * Upload to Telegram & insert to table in a transaction
       *
       */
      controller.enqueue(encoder.encode("Uploading sticker file to Telegram"));
      await db.transaction(async (tx) => {
        const uploadResponse = await uploadStickerFile({
          filePath,
          format: data.format,
          userId: locals.userId!,
        });
        if (!uploadResponse || !uploadResponse.ok) {
          // TODO: ensure that transaction rolls back
          throw error(500, { message: "Upload to telegram failed" });
        }

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
          file_path: objectPath,
          file_id: uploadResponse.result.file_id,
        });

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

        // TODO: ensure that transaction rolls back if API call fails
        if (newStickerResponse === null) {
          throw error(500, { message: "Upload to telegram failed" });
        }
      });
      await cleanup(epoch);

      controller.enqueue(encoder.encode("Stickerset created!"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "content-type": "text/event-stream" },
  });
};
