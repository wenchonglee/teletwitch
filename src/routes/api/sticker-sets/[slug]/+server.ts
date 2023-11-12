import { error, type RequestHandler } from "@sveltejs/kit";

import { sticker, stickerSet } from "$db/schema.js";
import { addStickerToSet, uploadStickerFile } from "$lib/server/telegram";
import { cleanup } from "$lib/server/webp";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../hooks.server.js";
import { getObject } from "../getObject.js";
import { PostSchema } from "../models.js";

/**
 * Add to an existing sticker-set
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
      try {
        const updateClient = (msg: string) => controller.enqueue(encoder.encode(msg));
        const { bucketPath, localFilePath, epoch } = await getObject(data, updateClient);

        /**
         *
         * Upload to Telegram & insert to table in a transaction
         *
         */
        controller.enqueue(encoder.encode("Uploading sticker file to Telegram"));
        await db.transaction(async (tx) => {
          const uploadResponse = await uploadStickerFile({
            filePath: localFilePath,
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
            file_path: bucketPath,
            file_id: uploadResponse.result.file_id,
          });

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
        controller.enqueue(encoder.encode("Something went wrong!"));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "content-type": "text/event-stream" },
  });
};
