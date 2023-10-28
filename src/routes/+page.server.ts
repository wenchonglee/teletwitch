import { stickerSet } from "$db/schema";
import { db } from "../hooks.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const stickerSets = await db.select().from(stickerSet);
  console.log(stickerSets);

  return {
    userId: locals.userId,
  };
};
