<script lang="ts">
  import EmoteCarousel from "$lib/components/EmoteCarousel.svelte";

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

<div class="hero">
  <h1 class="headline">Telegram stickers with Twitch emotes</h1>

  <EmoteCarousel {emotes} width={480} />

  <script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="teletwitchsticker_bot"
    data-size="large"
    data-userpic="false"
    data-auth-url="/api/login"
  ></script>

  <a class="subtext" href="/faq">Why do I need to log in?</a>
</div>

<style>
  .hero {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-1);
  }

  h1 {
    text-align: center;
    transition: font-size 200ms;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: var(--font-size-6);
    }
  }

  .subtext {
    font-size: var(--font-size-0);
    color: var(--gray-5);
  }
</style>
