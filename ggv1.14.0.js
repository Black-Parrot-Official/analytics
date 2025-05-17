(function () {
  const bait = document.createElement('div');
  bait.className = 'adsbox';
  bait.style.cssText = `
    width: 1px !important;
    height: 1px !important;
    position: absolute !important;
    left: -10000px !important;
    top: -1000px !important;
    background: url("https://example.com/ad_banner.jpg") !important;
    visibility: hidden !important;
  `;
  document.body.appendChild(bait);

  // Network bait (only for local server)
  const xhrBait = new XMLHttpRequest();
  let xhrBlocked = false;
  xhrBait.onreadystatechange = function () {
    if (xhrBait.readyState === 4 && xhrBait.status === 0) {
      xhrBlocked = true;
    }
  };
  xhrBait.open('GET', '/ads.js', true);
  xhrBait.send();

  // Firefox specific fingerprint (using internal `moz` props)
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Run detection after DOM
  setTimeout(() => {
    const baitBlocked = (
      bait.offsetHeight === 0 ||
      bait.offsetParent === null ||
      getComputedStyle(bait).display === 'none' ||
      getComputedStyle(bait).visibility === 'hidden'
    );

    const blocked = baitBlocked || xhrBlocked;

    if (blocked) {
      showBlockMessage();
    }

    document.body.removeChild(bait);
  }, 1500);

  // Full-page popup message
  function showBlockMessage() {
    const overlay = document.createElement('div');
    overlay.id = 'adblock-warning';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: #fff;
      color: #111;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 30px;
    `;

    // Sad face rain
    const emojiContainer = document.createElement('div');
    emojiContainer.style.position = 'absolute';
    emojiContainer.style.top = '0';
    emojiContainer.style.left = '0';
    emojiContainer.style.width = '100%';
    emojiContainer.style.height = '100%';
    emojiContainer.style.pointerEvents = 'none';
    emojiContainer.style.overflow = 'hidden';
    overlay.appendChild(emojiContainer);

    for (let i = 0; i < 40; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = '😢';
      emoji.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}vw;
        top: -5vh;
        font-size: ${Math.random() * 30 + 20}px;
        animation: fall ${Math.random() * 3 + 2}s linear infinite;
      `;
      emojiContainer.appendChild(emoji);
    }

    // Keyframe for animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(110vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    const title = document.createElement('h2');
    title.textContent = "😢 Oops! We detected an ad blocker";

    const msg = document.createElement('p');
    msg.innerHTML = `
      This site runs on ad revenue to stay online and deliver free content.<br>
      Please disable your ad blocker or use a different browser (like Chrome without blockers).<br><br>
      Thank you for supporting us ❤️
    `;

    const refresh = document.createElement('button');
    refresh.textContent = "I've disabled it, refresh";
    refresh.style.cssText = `
      margin-top: 20px;
      padding: 10px 20px;
      background: #111;
      color: white;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    `;
    refresh.onclick = () => location.reload();

    overlay.appendChild(title);
    overlay.appendChild(msg);
    overlay.appendChild(refresh);
    document.body.innerHTML = '';
    document.body.appendChild(overlay);
  }
})();
