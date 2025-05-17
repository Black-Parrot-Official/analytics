(function() {
  const overlayId = "adblock-overlay";

  function createOverlay(message) {
    if (document.getElementById(overlayId)) return;

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.cssText = `
      position: fixed;
      z-index: 999999;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      padding: 20px;
      text-align: center;
    `;

    const emojiRain = document.createElement("div");
    emojiRain.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 9999999;
    `;

    for (let i = 0; i < 100; i++) {
      const drop = document.createElement("div");
      drop.innerText = "😢";
      drop.style.cssText = `
        position: absolute;
        top: -50px;
        left: ${Math.random() * 100}vw;
        font-size: 2rem;
        animation: drop ${Math.random() * 3 + 2}s linear infinite;
      `;
      emojiRain.appendChild(drop);
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes drop {
        to {
          transform: translateY(110vh);
        }
      }
    `;
    document.head.appendChild(style);

    const messageBox = document.createElement("div");
    messageBox.innerHTML = `
      <h2>😢 Please disable your Ad Blocker</h2>
      <p>${message}</p>
      <p>Ads make it possible to run our servers and give you free content. Please consider allowing some ads to keep this service alive.</p>
    `;

    const btn = document.createElement("button");
    btn.innerText = "Refresh";
    btn.onclick = () => location.reload();
    btn.style.cssText = "margin-top: 20px; padding: 10px 20px; font-size: 1rem; cursor: pointer;";

    overlay.appendChild(emojiRain);
    overlay.appendChild(messageBox);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.remove();
  }

  function detectAdBlocker() {
    return new Promise(resolve => {
      const bait = document.createElement('div');
      bait.className = 'adsbox';
      bait.style.cssText = 'width:1px;height:1px;position:absolute;left:-10000px;top:-10000px;';
      document.body.appendChild(bait);
      setTimeout(() => {
        const blocked = bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none';
        document.body.removeChild(bait);
        resolve(blocked);
      }, 200);
    });
  }

  function detectDNSBlockers() {
    return fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', { method: 'HEAD', mode: 'no-cors' })
      .then(() => false)
      .catch(() => true); // Blocked by DNS or VPN
  }

  function detectBraveBrowser() {
    return navigator.brave && typeof navigator.brave.isBrave === 'function'
      ? navigator.brave.isBrave().then(result => result)
      : Promise.resolve(false);
  }

  async function checkAll() {
    const [adBlocked, dnsBlocked, isBrave] = await Promise.all([
      detectAdBlocker(),
      detectDNSBlockers(),
      detectBraveBrowser()
    ]);

    if (dnsBlocked) {
      createOverlay("It looks like you're using a DNS-based ad blocker (like AdGuard DNS or a VPN). Please switch to a normal network or disable the DNS blocker.");
    } else if (adBlocked || isBrave) {
      createOverlay("We noticed you're using Brave browser or an ad blocker. Please disable them or switch to Chrome for the best experience.");
    } else {
      removeOverlay();
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    checkAll();
  } else {
    window.addEventListener("DOMContentLoaded", checkAll);
  }
})();
