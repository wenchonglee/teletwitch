import { json, type RequestHandler } from "@sveltejs/kit";

import { cleanup, convertFramesToWebm, convertWebpToFrames, resizeWebp } from "$lib/server/webp";
import { addStickerToSet, createNewStickerSet, uploadStickerFile } from "$lib/server/telegram";
import { get7tvEmote } from "$lib/server/7tv";
import { readdirSync, statSync } from "node:fs";

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

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

  // const fileList = readdirSync("./");
  // const fileList2 = readdirSync("./vercel");
  // const fileList3 = readdirSync("/vercel");
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for (const file of fileList) {
        controller.enqueue(encoder.encode(file) + " ");
        await delay(500);
      }
      // for (let i = 0; i < 20; i++) {
      //   controller.enqueue(encoder.encode("hello"));
      //   await delay(1000);
      // }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "content-type": "text/event-stream",
    },
  });
}
/**
 * Creates a new sticker-set
 *
 */
export const POST: RequestHandler = async ({ request }) => {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("hello"));

      const form = await request.formData();
      const stickerUrl = form.get("stickerUrl") as string;

      for (const pair of form.entries()) {
        console.log(`${pair[0]}, ${pair[1]}`);
      }
      const tempName = Date.now().toString();
      controller.enqueue(encoder.encode("downloading video"));

      const emote = await get7tvEmote(stickerUrl);
      controller.enqueue(encoder.encode("resizing video"));
      const resizedWebpFileName = await resizeWebp(tempName, emote);
      // todo: if not animated, stop here

      controller.enqueue(encoder.encode("slicing video to images "));
      await convertWebpToFrames(tempName, resizedWebpFileName);
      controller.enqueue(encoder.encode("stitching images to webm"));
      const webmFileName = await convertFramesToWebm(tempName);
      await cleanup(tempName);
      await new Promise((resolve) => setTimeout(resolve, 5000));

      controller.enqueue(encoder.encode("uploading sticker file"));
      const uploadResponse = await uploadStickerFile({
        filePath: webmFileName,
        stickerFormat: form.get("stickerFormat") as "video",
        userId: form.get("userId") as string,
      });
      console.log(uploadResponse);
      if (!uploadResponse) {
        return json("oh no");
      }
      // https://github.com/sveltejs/kit/issues/5344

      controller.enqueue(encoder.encode("creating stickerset"));
      // const newStickerResponse = await createNewStickerSet({
      //   stickerFileId: uploadResponse.result.file_id,
      //   emojiList: ["🤣"],
      //   name: form.get("stickerSetName") as string,
      //   stickerFormat: form.get("stickerFormat") as "video",
      //   title: "mock_title",
      //   userId: form.get("userId") as string,
      // });

      // console.log(newStickerResponse);
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
export const PUT: RequestHandler = async ({ request }) => {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("hello"));

      try {
        const form = await request.formData();
        const stickerUrl = form.get("stickerUrl") as string;

        for (const pair of form.entries()) {
          console.log(`${pair[0]}, ${pair[1]}`);
        }
        const tempName = Date.now().toString();
        controller.enqueue(encoder.encode("downloading video"));

        const emote = await get7tvEmote(stickerUrl);
        controller.enqueue(encoder.encode("resizing video"));
        const resizedWebpFileName = await resizeWebp(tempName, emote);
        // todo: if not animated, stop here

        controller.enqueue(encoder.encode("slicing video to images "));
        await convertWebpToFrames(tempName, resizedWebpFileName);
        controller.enqueue(encoder.encode("stitching images to webm"));
        const webmFileName = await convertFramesToWebm(tempName);
        await cleanup(tempName);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        controller.enqueue(encoder.encode("uploading sticker file"));
        const uploadResponse = await uploadStickerFile({
          filePath: webmFileName,
          stickerFormat: form.get("stickerFormat") as "video",
          userId: form.get("userId") as string,
        });
        console.log(uploadResponse);
        if (!uploadResponse) {
          throw new Error("Upload failed");
        }
        // https://github.com/sveltejs/kit/issues/5344

        controller.enqueue(encoder.encode("adding to stickerset"));
        const newStickerResponse = await addStickerToSet({
          stickerFileId: uploadResponse.result.file_id,
          emojiList: ["🤣"],
          name: form.get("stickerSetName") as string,
          userId: form.get("userId") as string,
        });
        controller.enqueue(encoder.encode("sticker added!"));
      } catch (err) {
        console.log(err);
      }
      // console.log(newStickerResponse);
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
