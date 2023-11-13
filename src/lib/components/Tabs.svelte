<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export let defaultOption: string;
  export let options: { value: string; label: string }[];

  const selected = writable<string>(defaultOption);
  setContext("selected", selected);
</script>

<div class="container">
  <div role="tablist">
    {#each options as option}
      <button
        type="button"
        on:click={() => selected.set(option.value)}
        role="tab"
        data-open={$selected === option.value}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <div role="tabpanel">
    <slot />
  </div>
</div>

<style>
  .container {
    background-color: var(--gray-11);
    border-radius: 8px;
    padding: var(--size-4) var(--size-4);
    width: 100%;
  }

  div[role="tablist"] {
    display: flex;
    border-bottom: 2px solid var(--gray-5);
    font-weight: var(--font-weight-6);
  }

  button[role="tab"] {
    background-color: transparent;
    border-bottom: 2px solid transparent;
    transition: border-bottom 200ms;
    margin-bottom: -2px;
    padding-inline: var(--size-3);
  }

  button[data-open="true"] {
    border-bottom: 2px solid var(--orange-6);
  }
</style>
