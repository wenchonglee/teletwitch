<!-- Lifted from https://loading.io/  -->

<div class="lds-ring">
  <div />
  <div />
  <div />
  <div />
</div>

<style>
  .lds-ring {
    position: relative;
    margin: 10px auto;
    width: 32px;
    height: 32px;
  }
  .lds-ring div {
    display: block;
    position: absolute;
    width: 32px;
    height: 32px;
    border: 4px solid;
    border-radius: 50%;
    border-color: white transparent transparent transparent;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
