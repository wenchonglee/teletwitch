import { stickerSet } from "$db/schema";
import { eq } from "drizzle-orm";
import { db } from "../hooks.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const { userId } = locals;
  if (!userId) {
    return {};
  }

  const stickerSets = await db.select().from(stickerSet).where(eq(stickerSet.user_id, userId));

  return {
    userId: userId,
    stickerSets,
  };
};
