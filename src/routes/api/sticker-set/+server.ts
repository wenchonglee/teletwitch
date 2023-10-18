import { json, type RequestHandler } from "@sveltejs/kit";

import { cleanup, convertFramesToWebm, convertWebpToFrames, resizeWebp } from "$lib/server/webp";
import { createNewStickerSet, uploadStickerFile } from "$lib/server/telegram";
import { get7tvEmote } from "$lib/server/7tv";

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
  const stickerUrl = form.get("stickerUrl") as string;

  for (const pair of form.entries()) {
    console.log(`${pair[0]}, ${pair[1]}`);
  }
  const tempName = Date.now().toString();

  const emote = await get7tvEmote(stickerUrl);
  const resizedWebpFileName = await resizeWebp(tempName, emote);
  // todo: if not animated, stop here

  await convertWebpToFrames(tempName, resizedWebpFileName);
  const webmFileName = await convertFramesToWebm(tempName);
  await cleanup(tempName);
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const uploadResponse = await uploadStickerFile({
    filePath: webmFileName,
    stickerFormat: form.get("stickerFormat") as "video",
    userId: form.get("userId") as string,
  });
  console.log(uploadResponse);
  if (!uploadResponse) {
    return json("oh no");
  }

  const newStickerResponse = await createNewStickerSet({
    stickerFileId: uploadResponse.result.file_id,
    emojiList: ["🤣"],
    name: form.get("stickerSetName") as string,
    stickerFormat: form.get("stickerFormat") as "video",
    title: "mock_title",
    userId: form.get("userId") as string,
  });

  console.log(newStickerResponse);

  return json(newStickerResponse);
};
