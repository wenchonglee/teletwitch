import { writable } from "svelte/store";

function createStore() {
  const { subscribe, set, update } = writable({
    stickerFormat: "animated",
    stickerUrl: "",
  });

  return {
    subscribe,
    setStickerUrl: (url: string) => {
      update((prev) => ({
        ...prev,
        stickerUrl: url,
      }));
    },
  };
}

export const store = createStore();
