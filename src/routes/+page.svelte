<script>
  let stickerSetName = "";
</script>

<main>
  <div class="container">
    <h1>Teletwitch</h1>
    <div class="subtext">Convert 3rd party Twitch emotes to Telegram stickers</div>
    <div class="emotes">
      <img src="https://cdn.7tv.app/emote/62f1f34b1de84f086742bbf4/2x.webp" alt="jigglin" />
      <img src="https://cdn.7tv.app/emote/617f15a5b0bfad9428970713/2x.webp" alt="WIGGLE" />
      <img src="https://cdn.7tv.app/emote/60c0d373ff4047301e860e09/2x.webp" alt="KEKWiggle" />
      <img src="https://cdn.7tv.app/emote/64ee0aed1fb60a456607eab1/2x.webp" alt="owoWiggle" />
      <img src="https://cdn.7tv.app/emote/6257e5450017a3216caea5f0/2x.webp" alt="Wiggle" />
      <img src="https://cdn.7tv.app/emote/61ffea29a5c9454acb3a3f93/2x.webp" alt="guraWiggle" />
      <img src="https://cdn.7tv.app/emote/6102c9afa57eeb23c0e3e76c/2x.webp" alt="BIGFROGQUICK" />
    </div>
    <a href="/sticker-set/new">Create a new sticker set</a>

    <br />
    <br />
    <br />
    <input bind:value={stickerSetName} placeholder="Enter sticker set name" />

    {#if stickerSetName !== ""}
      <a href={`/sticker-set/${stickerSetName}`}>Update a sticker set</a>
    {/if}
  </div>
  <script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="teletwitchsticker_bot"
    data-size="large"
    data-onauth="onTelegramAuth(user)"
  ></script>
  <script type="text/javascript">
    function onTelegramAuth(user) {
      console.log(JSON.stringify(user));
      alert(
        "Logged in as " +
          user.first_name +
          " " +
          user.last_name +
          " (" +
          user.id +
          (user.username ? ", @" + user.username : "") +
          ")"
      );
    }
  </script>
</main>

<style>
  main {
    padding: var(--size-10);
    display: flex;
  }

  .subtext {
    color: var(--gray-5);
    font-size: var(--font-size-1);
  }

  .emotes {
    display: flex;
    gap: var(--size-4);
    margin-top: var(--size-2);
    margin-bottom: var(--size-4);
  }

  img {
    border-radius: var(--size-2);
    height: 64px;
  }

  a {
    font-size: var(--font-size-5);
  }
</style>
