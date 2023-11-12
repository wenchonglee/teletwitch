<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { onDestroy } from "svelte";
  import { fetchTTEmotes } from "./fetchEmotes";
  import { selectedSticker, stickerFormat } from "./store";

  let promise = fetchTTEmotes("", $stickerFormat === "video");

  stickerFormat.subscribe((run) => {
    promise = fetchTTEmotes("", $stickerFormat === "video");
  });

  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedInput = (e: Event) => {
    const currentTarget = e.currentTarget as EventTarget & HTMLInputElement;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
      promise = fetchTTEmotes(currentTarget.value, $stickerFormat === "video");
    }, 300);
  };

  onDestroy(() => {
    selectedSticker.set({ url: "", emote: "" });
  });
</script>

<div>
  <input type="text" placeholder="Search" on:input={debouncedInput} />
  <div class="emote-grid">
    {#await promise}
      <p>waiting...</p>
    {:then data}
      {#each data as emote}
        <button
          type="button"
          class="emote-container"
          data-selected={String($selectedSticker.url === emote.file_path)}
          on:click={() => selectedSticker.set({ url: emote.file_path ?? "", emote: emote.provider_emote ?? "" })}
          title={emote.provider_emote}
        >
          <img src={`${env["PUBLIC_BUCKET_PATH"]}/${emote.file_path}`} alt={emote.provider_emote} />
          <span class="emote-name">{emote.provider_emote}</span>
        </button>
      {/each}
    {:catch err}
      <p>{err}</p>
    {/await}
  </div>
</div>

<style>
  .emote-grid {
    display: grid;
    grid-gap: var(--size-4);
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .emote-container {
    background-color: var(--gray-10);
    border-radius: var(--radius-3);
    padding: var(--size-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border: var(--border-size-2) solid transparent;
    transition: background-color 200ms;
  }

  .emote-container:hover {
    background-color: var(--gray-9);
  }

  .emote-container[data-selected="true"] {
    background-color: var(--gray-9);
    border: var(--border-size-2) solid var(--orange-6);
  }

  .emote-container img {
    height: 56px;
    width: 56px;
    object-fit: contain;
    text-align: center;
  }

  .emote-name {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
    font-size: var(--font-size-0);
    padding-top: var(--size-1);
  }

  input {
    margin-block: var(--size-2);
    width: 100%;
  }
</style>
