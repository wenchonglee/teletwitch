<script lang="ts">
  import EmoteGrid7tv from "../EmoteGrid7tv.svelte";
  import { stickerUrl, stickerFormat } from "../store";
  import { PUBLIC_USER_ID } from "$env/static/public";
  import { page } from "$app/stores";

  let current = "empty";

  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
    formData.set("stickerUrl", $stickerUrl);
    console.log($stickerUrl);
    const response = await fetch("/api/sticker-set", {
      method: "PUT",
      body: formData,
    });
    if (!response.body) return;

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { value, done } = await reader.read();
      console.log(value);
      if (done) break;
      current = value;
    }
  }
</script>

<form on:submit|preventDefault={submit} class="form">
  <div class="grid w-full max-w-sm items-center gap-1.5">
    <label for="userId">User ID</label>
    <input required name="userId" autocomplete="off" value={PUBLIC_USER_ID} />
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <label for="title">Sticker pack name</label>
    <input required name="title" value={$page.params.slug} />
  </div>

  <div>
    <input type="radio" id="video" name="format" value="video" bind:group={$stickerFormat} />
    <label for="video">Video</label>
  </div>

  <div>
    <input type="radio" id="static" name="format" value="static" bind:group={$stickerFormat} />
    <label for="static">Static</label>
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <label for="emoji">Emote</label>
    <input required name="emoji" value="🤣" />
  </div>

  <button> Add </button>

  <EmoteGrid7tv />

  <p>{current}</p>
</form>

<style>
  .form {
    display: grid;
    padding: var(--size-4);
    gap: var(--size-2);
  }
</style>
