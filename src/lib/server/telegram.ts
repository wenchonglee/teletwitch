import { createReadStream } from "node:fs";
import axios, { AxiosError } from "axios";
import { BOT_TOKEN } from "$env/static/private";

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
  stickerFormat: "video" | "static";
};

const uploadStickerFile = async (params: UploadStickerFileParams) => {
  const { filePath, userId, stickerFormat } = params;
  const stream = createReadStream(filePath);
  console.log("uploading", filePath, userId, stickerFormat);
  try {
    const response = await tgAxios.post<UploadStickerFileResponse>(
      "/uploadStickerFile",
      {
        user_id: Number(userId),
        sticker: stream,
        sticker_format: stickerFormat,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
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
  emojiList: string[];
  stickerFormat: "video" | "static";
};

const createNewStickerSet = async (params: CreateNewStickerSetParams) => {
  const { userId, name, title, emojiList, stickerFileId, stickerFormat } = params;
  console.log("creating new stickerset", userId, name, title, emojiList, stickerFileId, stickerFormat);
  try {
    const response = await tgAxios.post<GenericResponse>("/createNewStickerSet", {
      user_id: Number(userId),
      name, // max 64 char
      title,
      stickers: [
        {
          emoji_list: emojiList,
          sticker: stickerFileId,
        },
      ],
      sticker_format: stickerFormat,
    });

    return response.data;
  } catch (err: any) {
    //   console.log(err.response.data);
    // TODO: handle errors
    console.log(err.response.data);
    return null;
  }
};

type AddStickerToSetParams = {
  userId: string;
  name: string;
  stickerFileId: string;
  emojiList: string[];
};

const addStickerToSet = async (params: AddStickerToSetParams) => {
  const { userId, name, emojiList, stickerFileId } = params;

  try {
    const response = await tgAxios.post<GenericResponse>("/addStickerToSet", {
      user_id: userId,
      name,
      sticker: {
        emoji_list: emojiList,
        sticker: stickerFileId,
      },
    });

    return response.data;
  } catch (err) {
    // TODO: handle errors
    return null;
  }
};

export { tgAxios, uploadStickerFile, createNewStickerSet, addStickerToSet };
