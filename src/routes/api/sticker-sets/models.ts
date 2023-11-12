import { z } from "zod";

export const PostSchema = z.object({
  format: z.enum(["video", "static"]),
  providerUrl: z.string().min(1, "providerUrl required"),
  emoji: z.preprocess((val) => {
    if (typeof val === "string") {
      return Array.from(val);
    }
  }, z.string().emoji().array().nonempty("emoji required")),
  // telegram name is max 64 chars
  // "_by_teletwitchsticker_bot" takes up 25chars
  title: z.string().min(1, "title required").max(39, "title cannot be longer than 39 characters"),
  emote: z.string().min(1, "emote required"),
});
