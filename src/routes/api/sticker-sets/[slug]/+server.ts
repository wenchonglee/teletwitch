import { error, type RequestHandler } from "@sveltejs/kit";

import { objectStore, sticker, stickerSet } from "$db/schema.js";
import { get7tvEmote } from "$lib/server/7tv";
import { addStickerToSet, uploadStickerFile } from "$lib/server/telegram";
import { cleanup, convertFramesToWebm, convertWebpToFrames, mkTmpdir, resizeWebp } from "$lib/server/webp";
import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { createReadStream } from "node:fs";
import { bucket, db } from "../../../../hooks.server.js";
import { PutSchema } from "../models.js";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

/**
 * Add to an existing sticker-set
 *
 */
export const POST: RequestHandler = async ({ request, locals }) => {
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
      try {
        /**
         *
         * Process the image
         *
         */
        const epoch = Date.now().toString();
        mkTmpdir(epoch);

        // if emote url is from teletwitch
        //   - check if it really exists in the object store
        //   - skip all processing
        //   - upload sticker file still needs it to be downloaded though
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

          const [existingStickerSet] = await tx
            .select()
            .from(stickerSet)
            .where(and(eq(stickerSet.title, data.title), eq(stickerSet.user_id, locals.userId!)))
            .limit(1);

          await tx.insert(sticker).values({
            sticker_set_id: existingStickerSet.id,
            emoji: data.emoji.join(","),
            file_path: objectPath,
            file_id: uploadResponse.result.file_id,
          });
          console.log("2");

          controller.enqueue(encoder.encode("Adding sticker to stickerset on Telegram"));
          const newStickerResponse = await addStickerToSet({
            stickerFileId: uploadResponse.result.file_id,
            emoji: data.emoji,
            name: `${data.title}_by_teletwitchsticker_bot`,
            userId: locals.userId!,
          });

          // TODO: ensure that transaction rolls back if API call fails
          if (newStickerResponse === null) {
            throw error(500, { message: "Upload to telegram failed" });
          }
        });
        await cleanup(epoch);

        controller.enqueue(encoder.encode("Sticker added!"));
        controller.close();
      } catch (err) {
        // if (err instanceof HttpError) {
        //   controller.enqueue(encoder.encode(err.body.message));
        // } else {
        controller.enqueue(encoder.encode("Something went wrong!"));
        // }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "content-type": "text/event-stream" },
  });
};
