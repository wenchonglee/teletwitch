import sharp from "sharp";
import util from "node:util";
import { exec as baseExec } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { platform, tmpdir } from "node:os";

ffmpeg.setFfmpegPath(path);
const exec = util.promisify(baseExec);
const tmp = tmpdir();

/**
 *
 * Resize the given image to at least 512 on 1 side
 *
 */
const resizeWebp = async (tempName: string, emote: ArrayBuffer) => {
  const fileName = `${tmp}/${tempName}.webp`;

  // TODO: determine if the file is animated and longer than 3seconds
  await sharp(emote, { animated: true }).resize(512).toFile(fileName);
  return fileName;
};

/**
 *
 * Slice the animated webp into png files
 *
 */
const convertWebpToFrames = async (prefix: string, webpFileName: string) => {
  if (platform() === "win32") {
    await exec(`"./bin/anim_dump.exe" -folder ${tmp} -prefix ${prefix}_ ${webpFileName}`);
  } else {
    await exec(`"./bin/anim_dump" -folder ${tmp} -prefix ${prefix}_ ${webpFileName}`);
  }
};

//
/**
 *
 * Convert the sliced png files to a webm file
 *
 */
const convertFramesToWebm = async (fileName: string) => {
  const webmFileName = `${tmp}/${fileName}.webm`;

  // TODO: resulting size must be below 256KB
  ffmpeg(`${tmp}/${fileName}_%04d.png`)
    //   .outputOptions(["-crf", "63"])
    .save(webmFileName);

  return webmFileName;
};

// TODO: cleanup all files
const cleanup = async (tempName: string) => {
  // resized webp
  // sliced pngs
  // created webm
};

export { convertFramesToWebm, convertWebpToFrames, cleanup, resizeWebp };
