import { browser } from "$app/environment";
import type { ObjectStore } from "$db/schema";
import { gql, request } from "graphql-request";

type Emote = {
  count: number;
  items: {
    id: string;
    name: string;
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
    return null;
  }
};

export const fetchTTEmotes = async (query: string = "", animated: boolean = true) => {
  if (!browser) {
    return [];
  }

  const response = await fetch("/api/stickers");
  const data = await response.json();

  return data as ObjectStore[];
};
