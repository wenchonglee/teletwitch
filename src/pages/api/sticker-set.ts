import type { APIRoute } from "astro";

import { cleanup, convertFramesToWebm, convertWebpToFrames, resizeWebp } from "@utils/webp";
import { uploadStickerFile } from "@utils/telegram";
import { get7tvEmote } from "@utils/7tv";

/**
 * Creates a new sticker-set
 *
 * Accepts:
 * - emoteUrl
 * - stickerSetName
 * -
 */
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const emoteUrl = form.get("emoteUrl") as string;

  const tempName = Date.now().toString();

  const emote = await get7tvEmote(emoteUrl);
  const resizedWebpFileName = await resizeWebp(tempName, emote);
  // todo: if not animated, stop here

  await convertWebpToFrames(tempName, resizedWebpFileName);
  await convertFramesToWebm(tempName);
  await cleanup();

  // const uploadResponse = await uploadStickerFile({filePath: , name, stickerFormat, title, userId})

  return new Response(
    JSON.stringify({
      test: "hello world",
    })
  );
};
