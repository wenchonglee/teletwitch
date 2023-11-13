import { error, json, type RequestHandler } from "@sveltejs/kit";

import { objectStore } from "$db/schema.js";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../hooks.server.js";

const QueryString = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(0).default(20),
  query: z.string().default(""),
  format: z.enum(["static", "video"]).optional(),
});

export const GET: RequestHandler = async ({ url }) => {
  const queryObj = QueryString.safeParse(Object.fromEntries(url.searchParams));

  if (!queryObj.success) {
    throw error(400, "Query string can only contain page, size, query, and format");
  }

  const { page, query, size, format } = queryObj.data;

  const queryCond = ilike(objectStore.provider_emote, `%${query}%`);
  const cond = format ? and(queryCond, eq(objectStore.format, format)) : queryCond;

  const stickers = await db
    .select()
    .from(objectStore)
    .where(cond)
    .limit(size)
    .offset(page * size);

  return json(stickers);
};
