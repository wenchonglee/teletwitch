<script>
  import "./global.css";
</script>

<div class="header">
  <a class="left-header" href="/">
    <img class="logo" src="/logo.png" alt="Logo" />
    <span> Teletwitch </span>
  </a>

  <a class="right-header" href="/faq">
    <span> FAQ </span>
  </a>
</div>
<slot />

<style>
  .header {
    padding: var(--size-3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-5);
  }

  .left-header {
    display: flex;
    gap: var(--size-2);
    align-items: center;
    color: white;
  }
  .left-header:hover {
    text-decoration: none;
  }

  .logo {
    width: 48px;
    height: 48px;
  }

  .right-header {
    display: flex;
    color: var(--gray-5);
  }
  .right-header:hover {
    text-decoration: none;
  }
</style>
