<script lang="ts">
  export let label: string;
  export let name: string;
  export let placeholder: string;
  export let required = false;
</script>

<div class="text-input">
  <label for={name}>{label}</label>
  <input {required} {name} type="text" {placeholder} />
</div>

<style>
  .text-input {
    display: flex;
    flex-direction: column;
  }

  .text-input > label {
    padding-bottom: var(--size-1);
  }

  .text-input > input {
    background-color: var(--gray-11);
  }
</style>
