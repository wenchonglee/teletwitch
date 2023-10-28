<script lang="ts">
  export let emotes: { src: string; alt: string }[];
  export let width: number;
  export let animationDuration: number = emotes.length * 2;
  const doubled = [...emotes, ...emotes];
</script>

<div class="carousel" style={`--emote-count:${emotes.length}; width: ${width}px`}>
  <div class="track" style={`--animation-length: ${animationDuration}s`}>
    {#each doubled as emote}
      <img src={emote.src} alt={emote.alt} />
    {/each}
  </div>
</div>

<style>
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translate(-50%, 0);
    }
  }

  .carousel {
    margin: auto;
    overflow: hidden;
    position: relative;
    border-radius: var(--size-2);
    max-width: 90vw;
  }

  .track {
    animation: scroll var(--animation-length) linear infinite;
    display: flex;
    width: calc(80px * var(--emote-count) * 2);
  }

  img {
    width: 80px;
    margin-right: 16px;
    border-radius: var(--size-2);
  }
</style>
