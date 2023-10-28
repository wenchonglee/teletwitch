import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const stickerSet = pgTable(
  "sticker_set",
  {
    id: serial("id").primaryKey(),
    user_id: text("user_id"),
    title: text("title"),
    format: varchar("format", { enum: ["video", "static"] }),
    created_date: timestamp("timestamp3").defaultNow(),
  },
  (table) => ({
    user_id_idx: index("user_id_idx").on(table.user_id),
  })
);

// count by provider_id order by count
export const sticker = pgTable("sticker", {
  id: serial("id").primaryKey(),
  sticker_set_id: integer("sticker_set_id").references(() => stickerSet.id),
  provider_url: text("provider_url"), // provider being 7tv/bttv
  provider_emote: text("provider_emote"), // e.g. HUH, jigglin
  object_url: text("object_url"), // converted url on supabase
  file_id: text("file_id"),
  emoji: text("emoji"),
  format: varchar("format", { enum: ["video", "static"] }),
});
