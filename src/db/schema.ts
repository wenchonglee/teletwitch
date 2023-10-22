import { index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

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
