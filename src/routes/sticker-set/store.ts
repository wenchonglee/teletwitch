import { writable } from "svelte/store";

export const stickerFormat = writable<"video" | "static">("static");
export const stickerUrl = writable("");
