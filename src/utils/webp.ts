import sharp from "sharp";
import util from "node:util";
import { exec as baseExec } from "node:child_process";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(path);
const exec = util.promisify(baseExec);

// TODO: determine if the file is animated and longer than 3seconds
const resizeWebp = async (file: File) => {
  const tempName = Date.now().toString();

  // * it seems this already handles rectangles??
  // resize the image to 512
  await sharp(await file.arrayBuffer(), { animated: true })
    .resize(512)
    .toFile(`${tempName}.webp`);
};

// TODO: tmp folder must exist
// TODO: to handle linux
const convertWebpToFrames = async (fileName: string) => {
  // slice the animation into png files
  const { stdout, stderr } = await exec(`"bin/anim_dump.exe" -folder tmp -prefix ${fileName}_ ${fileName}.webp`);
};

// TODO: resulting size must be below 256KB
// convert the png files to a webm file
const convertFramesToWebm = async (fileName: string) => {
  ffmpeg(`tmp/${fileName}_%04d.png`)
    //   .outputOptions(["-crf", "63"])
    .save(`tmp/${fileName}.webm`);
};

// TODO: cleanup all files
const cleanup = async () => {
  // resized webp
  // sliced pngs
  // created webm
};

export { convertFramesToWebm, convertWebpToFrames, cleanup, resizeWebp };
