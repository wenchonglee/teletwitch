<script lang="ts">
  import { fetch7tvEmotes } from "./fetchEmotes";
  import { store } from "./store";

  let promise = fetch7tvEmotes();

  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedInput = (query: string) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
      promise = fetch7tvEmotes(query);
    }, 300);
  };
</script>

<div>
  <input on:input={(e) => debouncedInput(e.currentTarget.value)} />
  <span>{$store.stickerUrl}</span>
  <div class="emote-grid">
    {#await promise}
      <p>waiting...</p>
    {:then data}
      {#each data.emotes.items as { name, host }}
        <button
          type="button"
          class="emote-container"
          data-selected={String($store.stickerUrl === `https:${host.url}/2x.webp`)}
          on:click={() => store.setStickerUrl(`https:${host.url}/2x.webp`)}
        >
          <img src={`https:${host.url}/2x.webp`} alt={name} title={name} />
          <span>{name}</span>
        </button>
      {/each}
    {:catch}
      <p>error</p>
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
  }

  .emote-container:hover {
    background-color: var(--surface-3);
  }

  .emote-container[data-selected="true"] {
    background-color: var(--surface-3);
  }

  .emote-container img {
    height: 56px;
    width: 56px;
    object-fit: contain;
    text-align: center;
  }
</style>
