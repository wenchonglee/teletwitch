<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  export let value: string;
  const selected = getContext<Writable<string>>("selected");
</script>

{#if $selected === value}
  <slot />
{/if}
