<script lang="ts">
  import type { HTMLLabelAttributes } from "svelte/elements";

  type $$Props = HTMLLabelAttributes;
</script>

<label
  class={"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"}
  {...$$restProps}
>
  <slot />
</label>
