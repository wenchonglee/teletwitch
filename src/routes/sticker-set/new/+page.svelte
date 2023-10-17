<script lang="ts">
  import EmoteGrid7tv from "./EmoteGrid7tv.svelte";
  import Input from "./Input.svelte";
  import Label from "./Label.svelte";
  import { store } from "./store";
  import { PUBLIC_USER_ID } from "$env/static/public";

  let responseMessage: string;

  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
    formData.set("stickerUrl", $store.stickerUrl);
    console.log($store.stickerUrl);
    const response = await fetch("/api/sticker-set", {
      method: "POST",
      body: formData,
    });
    // const data = await response.json();
    // responseMessage = data.message;
  }
</script>

<form on:submit|preventDefault={submit} class="form">
  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="userId">User ID</Label>
    <Input required name="userId" autocomplete="off" value={PUBLIC_USER_ID} />
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="stickerpackName">Sticker pack name</Label>
    <Input required name="stickerpackName" value="test_by_teletwitchsticker_bot" />
  </div>

  <div>
    <input type="radio" id="animated" name="stickerFormat" value="animated" checked />
    <label for="animated">Animated</label>
  </div>

  <div>
    <input type="radio" id="static" name="stickerFormat" value="static" />
    <label for="static">Static</label>
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <Label for="emojiList">Emote</Label>
    <Input required name="emojiList" value="🤣" />
  </div>

  <button> Create </button>

  <EmoteGrid7tv />
</form>

<style>
  .form {
    display: grid;
    padding: var(--size-4);
    gap: var(--size-2);
  }
</style>
