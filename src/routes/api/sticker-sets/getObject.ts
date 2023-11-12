import { objectStore } from "$db/schema.js";
import { env } from "$env/dynamic/public";
import { get7tvEmote } from "$lib/server/7tv";
import { convertFramesToWebm, convertWebpToFrames, mkTmpdir, resizeWebp } from "$lib/server/webp";
import { customAlphabet } from "nanoid";
import { createReadStream } from "node:fs";
import type { z } from "zod";
import { bucket, db } from "../../../hooks.server.js";
import type { PostSchema } from "./models.js";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export const getObject = async (data: z.infer<typeof PostSchema>, updateClient: (msg: string) => void) => {
  const epoch = Date.now().toString();
  mkTmpdir(epoch);

  if (data.providerUrl.includes(env.PUBLIC_BUCKET_PATH)) {
    // todo: check that it actually exists first
  }

  /**
   *
   * Process the image
   *
   */

  updateClient("Retrieving and resizing emote");
  const emote = await get7tvEmote(data.providerUrl);
  let localFilePath = await resizeWebp(epoch, emote);

  if (data.format === "video") {
    updateClient("Slicing emote into image frames");
    await convertWebpToFrames(epoch, localFilePath);

    updateClient("Stitching image frames into webm video");
    localFilePath = await convertFramesToWebm(epoch);

    // todo: do we need still need this arbitrary wait?
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  /**
   *
   * Upload image to supabase & insert to table
   *
   */
  const stream = createReadStream(localFilePath);
  const bucketPath = `${nanoid()}.${data.format === "video" ? "webm" : "webp"}`;
  const uploadedFile = await bucket.upload(bucketPath, stream, {
    cacheControl: "31536000",
    duplex: "half",
    contentType: data.format === "video" ? "video/webm" : "image/webp",
  });
  // todo: handle upload errors

  await db.insert(objectStore).values({
    file_path: bucketPath,
    format: data.format,
    provider_emote: data.emote,
    provider_url: data.providerUrl,
  });

  return {
    localFilePath,
    bucketPath,
    epoch,
  };
};
