import { request, gql } from "graphql-request";

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
  query ($query: String!) {
    emotes(query: $query, page: 0, limit: 25, filter: { animated: true }) {
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

const fetch7tvEmotes = async (query: string = "") => {
  const data = await request<Gql7tvResponse>("https://7tv.io/v3/gql", search7tv, {
    query,
  });

  return data;
};

export { fetch7tvEmotes };
