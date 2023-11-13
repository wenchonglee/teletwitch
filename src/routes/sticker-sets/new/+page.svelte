<script lang="ts">
  import { goto } from "$app/navigation";
  import Overlay from "$lib/components/Overlay.svelte";
  import Radio from "$lib/components/Radio.svelte";
  import TabItem from "$lib/components/TabItem.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
  import IconMovie from "$lib/icons/IconMovie.svelte";
  import IconPhotoFilled from "$lib/icons/IconPhotoFilled.svelte";
  import EmoteGrid7tv from "../EmoteGrid7tv.svelte";
  import EmoteGridTt from "../EmoteGridTT.svelte";
  import { selectedSticker, stickerFormat } from "../store";

  let current = "";

  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.set("providerUrl", $selectedSticker.url);
    formData.set("emote", $selectedSticker.emote);
    const response = await fetch("/api/sticker-sets", {
      method: "POST",
      body: formData,
    });
    if (!response.body) return;

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        setTimeout(() => {
          goto(`/sticker-sets/${formData.get("title")}`);
        }, 2000);
        break;
      }
      current = value;
    }
  }
</script>

<svelte:head>
  <title>New stickerset - Teletwitch</title>
</svelte:head>

<main>
  <h2>Create sticker set</h2>

  <form on:submit|preventDefault={submit} class="form">
    <TextInput label="Sticker set title" name="title" placeholder="Pepe" required />

    <div class="radio-container">
      <Radio name="format" label="Static" value="static" bind:selected={$stickerFormat}>
        <IconPhotoFilled />
      </Radio>
      <Radio name="format" label="Video" value="video" bind:selected={$stickerFormat}>
        <IconMovie />
      </Radio>
    </div>

    <TextInput label="Associated emoji" name="emoji" placeholder="Windows + ." required />
    <Tabs
      defaultOption="teletwitch"
      options={[
        { value: "teletwitch", label: "Teletwitch" },
        { value: "7tv", label: "7TV" },
      ]}
    >
      <TabItem value="teletwitch">
        <EmoteGridTt />
      </TabItem>
      <TabItem value="7tv">
        <EmoteGrid7tv />
      </TabItem>
    </Tabs>

    <button> Create sticker set</button>
  </form>

  <Overlay message={current} />
</main>

<style>
  main {
    padding-inline: var(--size-10);
    max-width: 1280px;
    margin: 0 auto;
    transition: padding 200ms;
  }

  .form {
    display: grid;
    gap: var(--size-3);
  }

  .radio-container {
    display: flex;
    gap: var(--size-3);
  }

  button {
    background-color: var(--gray-11);
    border-radius: var(--radius-3);
    padding: var(--size-2);
    border: 2px solid transparent;
    transition: transform 200ms, border 200ms ease-in;
  }

  button:hover {
    border: 2px solid var(--orange-6);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    main {
      padding-inline: var(--size-3);
    }

    button {
      position: fixed;
      bottom: 0;
      left: 0;
      border-radius: 0;
      width: 100vw;
    }
  }
</style>
