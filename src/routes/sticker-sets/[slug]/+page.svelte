<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { env } from "$env/dynamic/public";
  import TabItem from "$lib/components/TabItem.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
  import { onMount } from "svelte";
  import EmoteGrid7tv from "../EmoteGrid7tv.svelte";
  import EmoteGridTt from "../EmoteGridTT.svelte";
  import { selectedSticker, stickerFormat } from "../store";

  import Overlay from "$lib/components/Overlay.svelte";
  import IconTelegram from "$lib/icons/IconTelegram.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  //@ts-ignore
  // const os = navigator?.userAgentData?.platform
  // const tip = os === "Windows"
  let current = "";
  let hideOverlay: () => void;

  onMount(() => {
    stickerFormat.set(data.format);
  });

  async function submit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.set("providerUrl", $selectedSticker.url);
    formData.set("emote", $selectedSticker.emote);
    formData.set("title", $page.params.slug);
    formData.set("format", data.format);
    const response = await fetch(`/api/sticker-sets/${$page.params.slug}`, {
      method: "POST",
      body: formData,
    });
    if (!response.body) return;

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        hideOverlay();
        invalidateAll();
        break;
      }

      current = value;
    }
  }
</script>

<svelte:head>
  <title>{$page.params.slug} - Teletwitch</title>
</svelte:head>

<main>
  <div class="title">
    <h2>{$page.params.slug}</h2>

    <a
      class="title-link"
      href={`https://t.me/addstickers/${$page.params.slug}_by_teletwitchsticker_bot`}
      target="_blank"
    >
      <IconTelegram />
      Add to your Telegram account
    </a>
  </div>

  <form on:submit|preventDefault={submit} class="form">
    <div class="existing-title">Existing stickers</div>
    <div class="existing-grid">
      {#if data.format === "static"}
        {#each data.result as { sticker }}
          <img src={`${env["PUBLIC_BUCKET_PATH"]}/${sticker?.file_path}`} alt={sticker?.emoji} width={32} height={32} />
        {/each}
      {:else}
        {#each data.result as { sticker }}
          <video
            src={`${env["PUBLIC_BUCKET_PATH"]}/${sticker?.file_path}`}
            autoplay
            muted
            loop
            width={32}
            height={32}
          />
        {/each}
      {/if}
    </div>

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

    <TextInput label="Associated emoji" name="emoji" placeholder="Windows + ." required />

    <button> Add sticker </button>
  </form>

  <Overlay message={current} bind:hideOverlay />
</main>

<style>
  main {
    padding-inline: var(--size-10);
    max-width: 1280px;
    margin: 0 auto;
    transition: padding 200ms;
  }

  .title {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--size-1);
    align-items: baseline;
    margin-bottom: var(--size-2);
  }

  .title-link {
    display: flex;
    gap: var(--size-2);
    align-items: baseline;
  }

  .form {
    display: grid;
    gap: var(--size-2);
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

  .existing-title {
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
  }
  .existing-grid {
    display: grid;
    grid-gap: var(--size-4);
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
