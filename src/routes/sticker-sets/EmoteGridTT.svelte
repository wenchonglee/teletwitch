<script lang="ts">
  import { env } from "$env/dynamic/public";
  import EmptyPrompt from "$lib/components/EmptyPrompt.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { fetchTTEmotes } from "./fetchEmotes";
  import { selectedSticker, stickerFormat } from "./store";

  let promise = fetchTTEmotes("", $stickerFormat);

  stickerFormat.subscribe((run) => {
    promise = fetchTTEmotes("", $stickerFormat);
  });

  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedInput = (e: Event) => {
    const currentTarget = e.currentTarget as EventTarget & HTMLInputElement;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
      promise = fetchTTEmotes(currentTarget.value, $stickerFormat);
    }, 300);
  };

  onDestroy(() => {
    selectedSticker.set({ url: "", emote: "" });
  });
</script>

<div>
  <input type="text" placeholder="Search" on:input={debouncedInput} />
  <div>
    {#await promise}
      <div out:fade={{ duration: 250 }}>
        <LoadingSpinner />
      </div>
    {:then data}
      <div class="emote-grid" in:fade={{ delay: 250 }}>
        {#each data as emote}
          <button
            type="button"
            class="emote-container"
            data-selected={String($selectedSticker.url === emote.file_path)}
            on:click={() => selectedSticker.set({ url: emote.file_path ?? "", emote: emote.provider_emote ?? "" })}
            title={emote.provider_emote}
          >
            {#if $stickerFormat === "static"}
              <img src={`${env["PUBLIC_BUCKET_PATH"]}/${emote.file_path}`} alt={emote.provider_emote} />
            {:else}
              <video src={`${env["PUBLIC_BUCKET_PATH"]}/${emote.file_path}`} autoplay muted loop />
            {/if}
            <span class="emote-name">{emote.provider_emote}</span>
          </button>
        {/each}

        {#if data.length === 0}
          <EmptyPrompt description="No emotes found" />
        {/if}
      </div>
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
    text-align: center;
  }

  .emote-container video {
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
