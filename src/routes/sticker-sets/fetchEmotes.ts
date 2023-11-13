import { browser } from "$app/environment";
import type { ObjectStore } from "$db/schema";
import { ClientError, gql, request } from "graphql-request";

type Emote = {
  count: number;
  items: {
    id: string;
    name: string;
    animated: boolean;
    host: {
      url: string;
      files: {
        name: string;
        format: string;
        width: number;
        height: number;
        size: number;
        frame_count: number;
      }[];
    };
  }[];
};

type Gql7tvResponse = {
  emotes: Emote;
};

const search7tv = gql`
  query ($query: String!, $animated: Boolean!) {
    emotes(query: $query, page: 0, limit: 25, filter: { animated: $animated }) {
      count
      items {
        id
        name
        animated
        host {
          url
          files {
            name
            format
            width
            height
            size
            frame_count
          }
        }
      }
    }
  }
`;

export const fetch7tvEmotes = async (query: string = "", animated: boolean = true) => {
  try {
    const data = await request<Gql7tvResponse>("https://7tv.io/v3/gql", search7tv, {
      query,
      animated,
    });

    return data;
  } catch (err) {
    if (err instanceof ClientError) {
      if (err.response.errors?.some((item) => item.message.includes("Rate Limit Reached"))) {
        throw new Error("Too many requests, try again later (limitation of 7TV)");
      }
    }
    return null;
  }
};

export const fetchTTEmotes = async (
  query: string = "",
  format: "video" | "static" = "static"
): Promise<ObjectStore[]> => {
  if (!browser) {
    return [];
  }

  const searchParams = new URLSearchParams({
    query,
    format,
  });

  const response = await fetch(`/api/stickers?${searchParams}`);
  const data = await response.json();

  return data;
};
