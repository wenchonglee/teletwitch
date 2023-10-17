<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type $$Props = HTMLInputAttributes;

  export let value: $$Props["value"] = undefined;
</script>

<input
  bind:value
  on:blur
  on:change
  on:click
  on:focus
  on:keydown
  on:keypress
  on:keyup
  on:mouseover
  on:mouseenter
  on:mouseleave
  on:paste
  on:input
  {...$$restProps}
/>

<style>
  input {
    display: flex;
    width: 100%;
    padding: var(--size-2);
    border-radius: var(--radius-3);
  }
  /* "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors 
  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground 
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
  disabled:cursor-not-allowed disabled:opacity-50"} */
</style>
