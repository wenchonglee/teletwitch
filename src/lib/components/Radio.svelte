<script lang="ts">
  export let name: string;
  export let label: string;
  export let value: string;
  export let selected: string;
</script>

<div class="container">
  <input type="radio" id={value} {name} {value} bind:group={selected} hidden />
  <label for={value}>
    <slot />

    {label}
  </label>
</div>

<style>
  .container {
    display: flex;
  }

  label {
    font-size: var(--font-size-3);
    border-radius: var(--radius-3);
    background-color: var(--gray-11);

    color: white;
    padding: var(--size-3);
    border: 2px solid transparent;
    transition: transform 200ms, border 200ms ease-in;
    display: flex;
    gap: var(--size-2);
  }

  label:hover {
    text-decoration: none;
    transform: scale(1.05);
  }

  input[type="radio"]:checked + label {
    border: 2px solid var(--orange-6);
  }
</style>
