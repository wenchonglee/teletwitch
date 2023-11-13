<script lang="ts">
  import EmptyPrompt from "$lib/components/EmptyPrompt.svelte";
  import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { fetch7tvEmotes } from "./fetchEmotes";
  import { selectedSticker, stickerFormat } from "./store";

  let promise = fetch7tvEmotes("", $stickerFormat === "video");

  stickerFormat.subscribe((run) => {
    promise = fetch7tvEmotes("", $stickerFormat === "video");
  });

  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedInput = (e: Event) => {
    const currentTarget = e.currentTarget as EventTarget & HTMLInputElement;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
      promise = fetch7tvEmotes(currentTarget.value, $stickerFormat === "video");
    }, 300);
  };

  onDestroy(() => {
    selectedSticker.set({ url: "", emote: "" });
  });
</script>

<div>
  <input type="text" placeholder="Search" on:input={debouncedInput} />
  {#if $stickerFormat === "static"}
    <span><em> * 7TV does not allow filtering by static emotes, so animated emotes are disabled instead </em></span>
  {/if}
  <div>
    {#await promise}
      <div out:fade={{ duration: 250 }}>
        <LoadingSpinner />
      </div>
    {:then data}
      <div class="emote-grid" in:fade={{ delay: 250 }}>
        {#if data !== null}
          {#each data.emotes.items as { name, host, animated }}
            <button
              type="button"
              class="emote-container"
              data-selected={String($selectedSticker.url === `https:${host.url}/2x.webp`)}
              on:click={() => selectedSticker.set({ url: `https:${host.url}/2x.webp`, emote: name })}
              title={name}
              disabled={$stickerFormat === "static" && animated}
            >
              <img src={`https:${host.url}/2x.webp`} alt={name} title={name} />
              <span class="emote-name">{name}</span>
            </button>
          {/each}
          {#if data.emotes.items.length === 0}
            <EmptyPrompt description="No emotes found" />
          {/if}
        {/if}
      </div>
    {:catch err}
      <p>{err.message}</p>
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

  .emote-container:disabled {
    cursor: not-allowed;
    opacity: 0.25;
  }

  .emote-container:disabled:hover {
    background-color: var(--gray-10);
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

  em {
    font-size: var(--font-size-0);
    color: var(--gray-6);
  }
</style>
