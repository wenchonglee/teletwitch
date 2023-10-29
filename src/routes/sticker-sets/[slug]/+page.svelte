<script lang="ts">
  import { page } from "$app/stores";
  import Radio from "$lib/components/Radio.svelte";
  import IconMovie from "$lib/icons/IconMovie.svelte";
  import IconPhotoFilled from "$lib/icons/IconPhotoFilled.svelte";
  import EmoteGrid7tv from "../EmoteGrid7tv.svelte";
  import { selectedSticker, stickerFormat } from "../store";

  //@ts-ignore
  // const os = navigator?.userAgentData?.platform
  // const tip = os === "Windows"
  let current = "empty";

  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.set("providerUrl", $selectedSticker.url);
    formData.set("emote", $selectedSticker.emote);
    formData.set("title", $page.params.slug);
    const response = await fetch("/api/sticker-sets", {
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
  <div class="radio-container">
    <Radio name="format" label="Static" value="static" bind:selected={$stickerFormat}>
      <IconPhotoFilled />
    </Radio>
    <Radio name="format" label="Video" value="video" bind:selected={$stickerFormat}>
      <IconMovie />
    </Radio>
  </div>

  <div class="grid w-full max-w-sm items-center gap-1.5">
    <label for="emoji">Emote</label>
    <input required name="emoji" placeholder="Windows + ." />
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

  .radio-container {
    display: flex;
    gap: var(--size-3);
  }
</style>
