import { BOT_TOKEN } from "$env/static/private";
import axios from "axios";
import { createReadStream } from "node:fs";

const tgAxios = axios.create({
  baseURL: `https://api.telegram.org/bot${BOT_TOKEN}`,
});

type UploadStickerFileResponse = {
  ok: boolean;
  result: {
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
};

type GenericResponse = { ok: boolean; result: boolean };

type UploadStickerFileParams = {
  userId: string;
  filePath: string;
  format: "video" | "static";
};

const uploadStickerFile = async (params: UploadStickerFileParams) => {
  const { filePath, userId, format } = params;
  const stream = createReadStream(filePath);

  try {
    const response = await tgAxios.post<UploadStickerFileResponse>(
      "/uploadStickerFile",
      {
        user_id: Number(userId),
        sticker: stream,
        sticker_format: format,
      },
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (err: any) {
    // TODO: handle errors
    console.log(err.response.data);
    return null;
  }
};

type CreateNewStickerSetParams = {
  userId: string;
  name: string;
  title: string;
  stickerFileId: string;
  emoji: string[];
  format: "video" | "static";
};

const createNewStickerSet = async (params: CreateNewStickerSetParams) => {
  const { userId, name, title, emoji, stickerFileId, format } = params;

  try {
    const response = await tgAxios.post<GenericResponse>("/createNewStickerSet", {
      user_id: Number(userId),
      name, // max 64 char
      title,
      stickers: [
        {
          emoji_list: emoji,
          sticker: stickerFileId,
        },
      ],
      sticker_format: format,
    });

    return response.data;
  } catch (err: any) {
    // TODO: handle errors
    console.log(err.response.data);
    return null;
  }
};

type AddStickerToSetParams = {
  userId: string;
  name: string;
  stickerFileId: string;
  emoji: string[];
};

const addStickerToSet = async (params: AddStickerToSetParams) => {
  const { userId, name, emoji, stickerFileId } = params;

  try {
    const response = await tgAxios.post<GenericResponse>("/addStickerToSet", {
      user_id: userId,
      name,
      sticker: {
        emoji_list: emoji,
        sticker: stickerFileId,
      },
    });

    return response.data;
  } catch (err) {
    // TODO: handle errors
    return null;
  }
};

export { addStickerToSet, createNewStickerSet, tgAxios, uploadStickerFile };
