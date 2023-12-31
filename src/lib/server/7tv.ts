import axios from "axios";

export const get7tvEmote = async (url: string) => {
  if (!is7tvLink(url)) {
    throw new Error(`Url "${url}" doesn't belong to 7tv or isn't an emote`);
  }

  const response = await axios.get(url, { responseType: "arraybuffer" });

  return response.data;
};

export const is7tvLink = (url: string) => /^https:\/\/cdn\.7tv\.app\/emote\/.+\/[1-4]x\.webp$/.test(url);
