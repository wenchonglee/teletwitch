import { objectStore } from "$db/schema.js";
import { get7tvEmote, is7tvLink } from "$lib/server/7tv";
import { convertFramesToWebm, convertWebpToFrames, mkTmpdir, resizeWebp } from "$lib/server/webp";
import { customAlphabet } from "nanoid";
import { createReadStream, writeFileSync } from "node:fs";
import type { z } from "zod";
import { bucket, db } from "../../../hooks.server.js";
import type { PostSchema } from "./models.js";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export const getObject = async (data: z.infer<typeof PostSchema>, updateClient: (msg: string) => void) => {
  const epoch = Date.now().toString();
  const tmpDir = mkTmpdir(epoch);

  // todo: can be more robust
  if (!is7tvLink(data.providerUrl)) {
    const downloaded = await bucket.download(data.providerUrl);
    if (!downloaded.data) {
      throw new Error("File doesn't exist");
    }

    const buffer = Buffer.from(await downloaded.data.arrayBuffer());
    const localFilePath = `${tmpDir}/blob`;
    writeFileSync(localFilePath, buffer);

    return {
      localFilePath,
      bucketPath: data.providerUrl,
      epoch,
    };
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
  const fileStream = createReadStream(localFilePath);
  const bucketPath = `${nanoid()}.${data.format === "video" ? "webm" : "webp"}`;
  const uploadedFile = await bucket.upload(bucketPath, fileStream, {
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
