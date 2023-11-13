<script lang="ts">
  export let description: string;
  const emotes = [
    "https://cdn.7tv.app/emote/60abf171870d317bef23d399/2x.webp",
    "https://cdn.7tv.app/emote/64bec66dfb581ca4e4d21a3f/2x.webp",
  ];
  const randomEmote = emotes[Math.floor(Math.random() * emotes.length)];
</script>

<div>
  <img src={randomEmote} alt="modCheck" />
  <span> {description} </span>
</div>

<style>
  div {
    margin: 10px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: var(--gray-5);
    font-size: var(--font-size-1);
    gap: var(--size-2);
  }

  img {
    border-radius: var(--radius-2);
  }
</style>
