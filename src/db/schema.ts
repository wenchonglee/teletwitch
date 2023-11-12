import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const stickerSet = pgTable(
  "sticker_set",
  {
    id: serial("id").primaryKey(),
    user_id: text("user_id").notNull(),
    title: text("title").notNull(),
    format: varchar("format", { enum: ["video", "static"] }).notNull(),
    created_date: timestamp("created_date").defaultNow(),
  },
  (table) => ({
    user_id_idx: index("user_id_idx").on(table.user_id),
  })
);

export const sticker = pgTable("sticker", {
  id: serial("id").primaryKey(),
  sticker_set_id: integer("sticker_set_id")
    .references(() => stickerSet.id)
    .notNull(),
  file_path: text("file_path").references(() => objectStore.file_path),
  file_id: text("file_id"), // file_id from telegram ! we need this for deleting stickers
  emoji: text("emoji").notNull(),
});
export type SelectSticker = typeof sticker.$inferSelect;

export const objectStore = pgTable("object_store", {
  file_path: text("file_path").primaryKey(),
  provider_url: text("provider_url").notNull(), // provider being 7tv/bttv
  provider_emote: text("provider_emote").notNull(), // e.g. HUH, jigglin
  format: varchar("format", { enum: ["video", "static"] }).notNull(),
  created_date: timestamp("created_date").defaultNow(),
});
