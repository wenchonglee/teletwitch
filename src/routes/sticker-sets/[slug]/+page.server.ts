import { sticker, stickerSet } from "$db/schema";
import { eq } from "drizzle-orm";
import { db } from "../../../hooks.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  //  locals.userId,
  const result = await db.select().from(stickerSet).leftJoin(sticker, eq(stickerSet.id, sticker.sticker_set_id));
  return {
    format: result[0].sticker_set.format!,
    result,
  };
};
