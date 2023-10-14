import type { APIRoute } from "astro";

import { cleanup, convertFramesToWebm, convertWebpToFrames, resizeWebp } from "@utils/webp";
import { uploadStickerFile } from "@utils/telegram";

/**
 * Creates a new sticker-set
 *
 * Accepts:
 * - file
 * - stickerSetName
 * -
 */
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const file = form.get("webp") as File;

  const tempName = Date.now().toString();

  await resizeWebp(file);
  await convertWebpToFrames(tempName);
  await convertFramesToWebm(tempName);
  await cleanup();

  // const uploadResponse = await uploadStickerFile({filePath: , name, stickerFormat, title, userId})

  return new Response(
    JSON.stringify({
      test: "hello world",
    })
  );
};
