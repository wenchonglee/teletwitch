<script lang="ts">
  import { store } from "./store";
</script>

<div>
  <input
    on:change={(e) => {
      store.filter(e.currentTarget.value);
    }}
  />

  <div class="emote-grid">
    {#each $store?.data?.items as { id, name, host }, i}
      <div class="emote-container" data-selected={String(false)}>
        <img src={`https:${host.url}/2x.webp`} alt={name} title={name} />
        <span>{name}</span>
      </div>
    {/each}
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
