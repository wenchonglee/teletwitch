<script lang="ts">
  import { onDestroy } from "svelte";
  import { fetch7tvEmotes } from "./fetchEmotes";
  import { selectedSticker, stickerFormat } from "./store";

  let promise = fetch7tvEmotes("", $stickerFormat === "video");

  stickerFormat.subscribe((run) => {
    promise = fetch7tvEmotes("", $stickerFormat === "video");
  });

  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedInput = (query: string) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
      promise = fetch7tvEmotes(query, $stickerFormat === "video");
    }, 300);
  };

  onDestroy(() => {
    selectedSticker.set({ url: "", emote: "" });
  });
</script>

<div>
  <input placeholder="Search" on:input={(e) => debouncedInput(e.currentTarget.value)} />
  <span>{$selectedSticker.url}</span>
  <div class="emote-grid">
    {#await promise}
      <p>waiting...</p>
    {:then data}
      {#if data !== null}
        {#each data.emotes.items as { name, host }}
          <button
            type="button"
            class="emote-container"
            data-selected={String($selectedSticker.url === `https:${host.url}/2x.webp`)}
            on:click={() => selectedSticker.set({ url: `https:${host.url}/2x.webp`, emote: name })}
          >
            <img src={`https:${host.url}/2x.webp`} alt={name} title={name} />
            <span>{name}</span>
          </button>
        {/each}
      {/if}
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
    background-color: var(--surface-2);
    border-radius: var(--radius-3);
    padding: var(--size-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border: var(--border-size-2) solid transparent;
  }

  .emote-container:hover {
    background-color: var(--surface-3);
  }

  .emote-container[data-selected="true"] {
    background-color: var(--surface-3);
    border: var(--border-size-2) solid var(--orange-5);
  }

  .emote-container img {
    height: 56px;
    width: 56px;
    object-fit: contain;
    text-align: center;
  }
</style>