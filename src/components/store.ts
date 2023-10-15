import { writable } from "svelte/store";
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

const searchEmote = gql`
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
type Store = {
  query: string;
  data: Emote;
};

// todo:  throws `stop is not a function` error if async/await
const fetch7tvEmotes = (set: (value: Store) => void) => {
  request<Gql7tvResponse>("https://7tv.io/v3/gql", searchEmote, {
    query: "",
  })
    .then((data) =>
      set({
        query: "",
        data: data.emotes,
      })
    )
    .catch((err) => {});
};

function create7tvStore() {
  const { subscribe, set } = writable<Store>(
    {
      query: "",
      data: {
        count: 0,
        items: [],
      },
    },
    (set, update) => fetch7tvEmotes(set)
  );

  return {
    subscribe,
    filter: (query: string) => {
      request<Gql7tvResponse>("https://7tv.io/v3/gql", searchEmote, {
        query,
      })
        .then((data) =>
          set({
            query,
            data: data.emotes,
          })
        )
        .catch((err) => {});
    },
    // increment: () => update((n) => n + 1),
    // decrement: () => update((n) => n - 1),
    // reset: () => set(0),
  };
}

export const store = create7tvStore();
