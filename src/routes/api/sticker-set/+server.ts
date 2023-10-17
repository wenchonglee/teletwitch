import { json, type RequestHandler } from "@sveltejs/kit";

import { cleanup, convertFramesToWebm, convertWebpToFrames, resizeWebp } from "$lib/webp";
import { uploadStickerFile } from "$lib/telegram";
import { get7tvEmote } from "$lib/7tv";

export function GET() {
  const number = Math.floor(Math.random() * 6) + 1;

  return json(number);
}

/**
 * Creates a new sticker-set
 *
 * Accepts:
 * - emoteUrl
 * - stickerSetName
 * -
 */
export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const emoteUrl = form.get("emoteUrl") as string;

  for (const pair of form.entries()) {
    console.log(`${pair[0]}, ${pair[1]}`);
  }
  // const tempName = Date.now().toString();

  // const emote = await get7tvEmote(emoteUrl);
  // const resizedWebpFileName = await resizeWebp(tempName, emote);
  // // todo: if not animated, stop here

  // await convertWebpToFrames(tempName, resizedWebpFileName);
  // await convertFramesToWebm(tempName);
  // await cleanup();

  // const uploadResponse = await uploadStickerFile({filePath: , name, stickerFormat, title, userId})

  return json({
    test: "hello world",
  });
};
