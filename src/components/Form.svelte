<script lang="ts">
  import Input from "./Input.svelte";
  import Label from "./Label.svelte";

  let responseMessage: string;

  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const response = await fetch("/api/webp", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    responseMessage = data.message;
  }
</script>

<form on:submit|preventDefault={submit} class="form">
  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="userId">User ID</Label>
    <Input required name="userId" autocomplete="off" value="391584629" />
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="stickerpackName">Sticker pack name</Label>
    <Input required name="stickerpackName" value="test_by_teletwitchsticker_bot" />
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="webp">File</Label>
    <Input required type="file" name="webp" />
  </div>

  <button> Send</button>

  {#if responseMessage}
    <p>{responseMessage}</p>
  {/if}
</form>

<style>
  .form {
    display: grid;
    padding: var(--size-4);
    gap: var(--size-2);
  }
</style>
