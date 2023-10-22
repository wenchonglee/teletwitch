import { z } from "zod";

const PostSchema = z.object({
  userId: z.coerce.string().min(1, "userId required"),
  format: z.enum(["video", "static"]),
  stickerUrl: z.string().min(1, "stickerUrl required"),
  emoji: z.preprocess((val) => {
    if (typeof val === "string") {
      return val.split(",");
    }
  }, z.string().emoji().array().nonempty("emoji required")),
  // telegram name is max 64 chars
  // "_by_teletwitchsticker_bot" takes up 25chars
  title: z.string().min(1, "title required").max(39, "title cannot be longer than 39 characters"),
});

const PutSchema = PostSchema.omit({
  // todo: remove the need to pass format
  //   format: true,
  //   title: true,
});

export { PostSchema, PutSchema };
