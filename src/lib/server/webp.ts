import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { exec as baseExec } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { platform, tmpdir } from "node:os";
import util from "node:util";
import sharp from "sharp";

ffmpeg.setFfmpegPath(path);
const exec = util.promisify(baseExec);
const tmp = import.meta.env["DEV"] ? "tmp" : tmpdir();

/**
 *
 * Resize the given image to at least 512 on 1 side
 *
 */
export const resizeWebp = async (epoch: string, emote: ArrayBuffer) => {
  const fileName = `${tmp}/${epoch}/tmp.webp`;

  // TODO: determine if the file is animated and longer than 3seconds
  await sharp(emote, { animated: true }).resize(512).toFile(fileName);
  return fileName;
};

/**
 *
 * Slice the animated webp into png files
 *
 */
export const convertWebpToFrames = async (epoch: string, webpFileName: string) => {
  const path = import.meta.env["DEV"] ? "./bin" : "/app/bin";
  const binary = platform() === "win32" ? "anim_dump.exe" : "anim_dump";

  await exec(`"${path}/${binary}" -folder ${tmp}/${epoch} -prefix frame_ ${webpFileName}`);
};

/**
 *
 * Convert the sliced png files to a webm file
 *
 */
export const convertFramesToWebm = async (epoch: string) => {
  const webmFileName = `${tmp}/${epoch}/out.webm`;

  // TODO: resulting size must be below 256KB
  ffmpeg(`${tmp}/${epoch}/frame_%04d.png`)
    //   .outputOptions(["-crf", "63"])
    .save(webmFileName);

  return webmFileName;
};

/**
 * TODO: refactor this
 */
export const mkTmpdir = (epoch: string) => {
  mkdirSync(`${tmp}/${epoch}`);
};

// TODO: cleanup all files
/**
 * Recursively removes all files in the tmp folder, contains:
 * - Resized webp
 * - (if video) Sliced png files
 * - (if video) Created webm file
 */
export const cleanup = async (epoch: string) => {
  rmSync(`${tmp}/${epoch}`, {
    force: true,
    recursive: true,
  });
};
