<script lang="ts">
  import { slide } from "svelte/transition";
  import LoadingSpinner from "./LoadingSpinner.svelte";

  export let message: string;
  let timeoutId: NodeJS.Timeout;

  const timeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      message = "";
    }, 3_000);
  };

  $: message, timeout();
</script>

<div class="overlay" data-empty={message.length === 0}>
  <div class="message-container">
    <div class="message">
      <LoadingSpinner />
      {#key message}
        <div transition:slide>
          {message}
        </div>
      {/key}
    </div>
  </div>
</div>

<style>
  .overlay[data-empty="true"] {
    display: none;
  }
  .overlay {
    right: 0;
    bottom: 0;
    position: fixed;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.65);
  }

  .message-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
  }

  .message {
    text-align: center;
    background-color: var(--gray-10);
    width: 50%;
    max-height: 80vh;
    padding: var(--size-3);
    border-radius: var(--radius-3);
    border: 2px solid var(--gray-9);
  }
</style>
