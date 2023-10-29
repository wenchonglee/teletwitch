<script lang="ts">
  import EmoteCarousel from "$lib/components/EmoteCarousel.svelte";
  import type { PageData } from "./$types";
  import Hero from "./Hero.svelte";

  export let data: PageData;
  const emotes = [
    { src: "https://cdn.7tv.app/emote/62f1f34b1de84f086742bbf4/2x.webp", alt: "jigglin" },
    { src: "https://cdn.7tv.app/emote/617f15a5b0bfad9428970713/2x.webp", alt: "WIGGLE" },
    { src: "https://cdn.7tv.app/emote/60c0d373ff4047301e860e09/2x.webp", alt: "KEKWiggle" },
    { src: "https://cdn.7tv.app/emote/64ee0aed1fb60a456607eab1/2x.webp", alt: "owoWiggle" },
    { src: "https://cdn.7tv.app/emote/6257e5450017a3216caea5f0/2x.webp", alt: "Wiggle" },
    { src: "https://cdn.7tv.app/emote/61ffea29a5c9454acb3a3f93/2x.webp", alt: "guraWiggle" },
    { src: "https://cdn.7tv.app/emote/6102c9afa57eeb23c0e3e76c/2x.webp", alt: "BIGFROGQUICK" },
  ];
</script>

<svelte:head>
  <title>Teletwitch</title>
  <meta name="description" content="Create Telegram stickers from Twitch emotes" />
</svelte:head>
<main>
  {#if data.userId === undefined}
    <Hero />
  {:else}
    <div class="container">
      <a class="new-sticker-set" href="/sticker-sets/new">
        <div>Create sticker set</div>

        <EmoteCarousel {emotes} width={320} />
      </a>

      <div class="list-title">Your sticker sets</div>
      <div class="sticker-set-grid">
        {#each data.stickerSets as stickerSet}
          <a class="sticker-set" href={`/sticker-sets/${stickerSet.title}`}>
            <div class="sticker-set-title">
              {stickerSet.title}
            </div>
            <div class="subtext">
              {stickerSet.format}
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    padding-inline: var(--size-10);
    display: flex;
    max-width: 1280px;
    justify-content: center;
    margin: 0 auto;
    transition: padding 200ms;
  }

  @media (max-width: 768px) {
    main {
      padding-inline: var(--size-3);
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
  }

  a.new-sticker-set {
    font-size: var(--font-size-4);
    border-radius: var(--radius-3);
    background-color: var(--gray-11);
    color: white;
    padding: var(--size-5);
    border: 2px solid transparent;
    transition: transform 200ms;
  }

  a.new-sticker-set:hover {
    text-decoration: none;
    border: 2px solid var(--orange-6);
    transform: scale(1.05);
  }

  .list-title {
    margin-top: var(--size-8);
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-5);
  }

  .sticker-set-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--size-3);
  }

  a.sticker-set {
    color: white;
    border-radius: var(--size-2);
    padding: 12px;
    border: 2px solid transparent;
    background-color: var(--gray-11);
    transition: transform 200ms;
  }

  a.sticker-set:hover {
    text-decoration: none;
    border: 2px solid var(--orange-6);
    transform: scale(1.05);
  }

  .sticker-set-title {
    font-weight: 500;
  }

  .subtext {
    color: var(--gray-6);
    font-size: var(--font-size-0);
  }
</style>
