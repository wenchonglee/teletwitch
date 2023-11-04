import { sticker, stickerSet } from "$db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "../../../hooks.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  const result = await db
    .select()
    .from(stickerSet)
    .leftJoin(sticker, eq(stickerSet.id, sticker.sticker_set_id))
    .where(and(eq(stickerSet.title, params.slug), eq(stickerSet.user_id, locals.userId!)));

  return {
    format: result[0].sticker_set.format!,
    result,
  };
};
