<main>
  <div class="container">
    <h1>FAQ</h1>
    <div class="section-head">Why do I need to log in?</div>
    <div>
      Telegram bots can only create sticker sets on a user's behalf. This means that after Teletwitch creates a sticker
      set for you:
      <ul>
        <li>You are the only one who can modify it</li>
        <li>
          You can freely modify the sticker set with <a href="https://telegram.me/stickers">@Stickers bot</a> yourself
          <br />(but you shouldn't, read more below)
        </li>
      </ul>
      <br />
      Teletwitch does not collect or keep any info from you other than your User ID. You can review this in the
      <a href="https://github.com/wenchonglee/teletwitch" target="_blank" title="Source"> source code</a>.
    </div>

    <div class="section-head">Limitations</div>
    <ul>
      <li>
        Telegram stickers have <a href="https://core.telegram.org/stickers">specific requirements</a>. Most importantly,
        stickers must be <code>512px</code> on 1 side and videos cannot be longer than 3 seconds or larger than
        <code>256KB</code>
      </li>
      <li>
        Unless an unexpected error occurred on Teletwitch, you should&nbsp;<strong>not</strong> modify your sticker sets
        outside of Teletwitch. Sticker sets created here are not synchronized with Telegram and all modifications are assumed
        to be made here
      </li>
      <li>
        Creating stickers may be slow because Teletwitch uses free resources and must always interface with Telegram
        APIs
      </li>
    </ul>
    <div class="section-head">My stickers are out of sync</div>
    <div>
      As above, this is a hobby project that uses free resources; there are some points of failure that Teletwitch makes
      no effort in recovering from. (e.g. I would need to introduce a message queue for more resilience) <br /><br />
      In most cases, you should be able to recover by manually removing stickers using
      <a href="https://telegram.me/stickers">@Stickers bot</a>. You can also report issues or make requests on the
      <a href="https://github.com/wenchonglee/teletwitch/issues" target="_blank" title="Source">Github issue board</a>.
    </div>
  </div>
</main>

<style>
  main {
    padding-left: var(--size-3);
    padding-right: var(--size-3);
    display: flex;
    max-width: 800px;
    margin: 0 auto;
    transition: padding 200ms;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    font-size: var(--font-size-1);
  }

  .section-head {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
  }

  li {
    font-size: var(--font-size-1);
    max-inline-size: none;
  }
</style>
