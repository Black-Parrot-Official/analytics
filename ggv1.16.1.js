(function () {
  // Utility: DOM element for bait
  const baitDiv = document.createElement('div');
  baitDiv.className = 'adsbox';
  baitDiv.style.cssText = `
    width: 1px;
    height: 1px;
    position: absolute;
    left: -10000px;
    top: -1000px;
    background: url('https://example.com/ad.jpg');
    visibility: hidden;
    pointer-events: none;
  `;
  document.body.appendChild(baitDiv);

  // Test: JS Variable block (some blockers kill scripts)
  let jsCheckPassed = true;
  try {
    window.__baitCheck = true;
  } catch (e) {
    jsCheckPassed = false;
  }

  // Brave detection
  const detectBrave = () =>
    navigator.brave && typeof navigator.brave.isBrave === 'function'
      ? navigator.brave.isBrave()
      : Promise.resolve(false);

  // Image ad load test (DNS/VPN-based blocking)
  const dnsBlockTest = () =>
    new Promise((resolve) => {
      const img = new Image();
      img.src =
        'https://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKDz76ChLxABEAEY2aS8dy-UAb7B';
      img.onload = () => resolve(false);
      img.onerror = () => resolve(true);
    });

  // Ad script network test
  const adScriptTest = () =>
    new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        true
      );
      xhr.onload = () => resolve(false); // no block
      xhr.onerror = () => resolve(true); // blocked by DNS/VPN
      xhr.send();
    });

  // Begin testing
  setTimeout(async () => {
    const baitBlocked =
      baitDiv.offsetHeight === 0 ||
      getComputedStyle(baitDiv).display === 'none' ||
      getComputedStyle(baitDiv).visibility === 'hidden';

    const [dnsBlocked, scriptBlocked, isBrave] = await Promise.all([
      dnsBlockTest(),
      adScriptTest(),
      detectBrave(),
    ]);

    const isDNSBlock = dnsBlocked && scriptBlocked;
    const isJSBlocked = !jsCheckPassed || baitBlocked;

    const adBlocked = isJSBlocked || isDNSBlock || isBrave;

    // Remove bait
    baitDiv.remove();

    if (adBlocked) {
      showBlockOverlay({ isBrave, isDNSBlock });
    }
  }, 1000);

  function showBlockOverlay({ isBrave, isDNSBlock }) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #ffffff;
      color: #111111;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999999;
      padding: 20px;
      text-align: center;
    `;

    // Sad face rain
    const emojiRain = document.createElement('div');
    emojiRain.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      top: 0;
      left: 0;
    `;
    for (let i = 0; i < 40; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = '😢';
      emoji.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}vw;
        top: -5vh;
        font-size: ${Math.random() * 30 + 20}px;
        opacity: 0.8;
        animation: fall ${Math.random() * 3 + 3}s linear forwards;
      `;
      emojiRain.appendChild(emoji);
    }
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

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Ad Blocker Detected 😢';

    // Message
    const message = document.createElement('p');
    message.innerHTML = isDNSBlock
      ? `We detected you're using a DNS-based ad blocker or VPN (like AdGuard DNS or Pi-hole).<br><br>Please consider disabling it or switching to a standard network to support us.`
      : isBrave
      ? `You're using Brave, which blocks ads by default.<br><br>Please open this site in Chrome with ad blocker disabled.`
      : `Ads help us run this service and offer free content.<br><br>Please disable your ad blocker to continue.`;

    // Refresh button
    const refresh = document.createElement('button');
    refresh.textContent = 'I’ve Disabled It – Refresh';
    refresh.style.cssText = `
      padding: 10px 20px;
      margin-top: 20px;
      font-size: 16px;
      background: #111;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    `;
    refresh.onclick = () => location.reload();

    overlay.appendChild(emojiRain);
    overlay.appendChild(title);
    overlay.appendChild(message);
    overlay.appendChild(refresh);

    document.body.innerHTML = '';
    document.body.appendChild(overlay);
  }
})();
