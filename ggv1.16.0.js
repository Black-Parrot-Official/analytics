(function () {
  let detectionPassed = false;

  // Create a bait div
  const bait = document.createElement('div');
  bait.className = 'adsbox pub_300x250';
  bait.style.cssText = `
    width: 1px !important;
    height: 1px !important;
    position: absolute !important;
    left: -10000px !important;
    top: -1000px !important;
    background: url("https://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKDz76ChLxABEAEY2aS8dy-UAb7B") !important;
    visibility: hidden !important;
    z-index: -9999;
  `;
  document.body.appendChild(bait);

  // Network bait
  const xhrBait = new XMLHttpRequest();
  xhrBait.open("GET", "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", true);

  xhrBait.onerror = function () {
    detectionPassed = true;
  };

  xhrBait.onload = function () {
    if (xhrBait.status === 403 || xhrBait.status === 0) {
      detectionPassed = true;
    }
  };

  xhrBait.send();

  // JS inline script bait (blocked by uBlock)
  const inlineScriptBait = document.createElement("script");
  inlineScriptBait.innerHTML = "window.__adblock_bait = false;";
  document.body.appendChild(inlineScriptBait);

  setTimeout(() => {
    const baitBlocked =
      bait.offsetHeight === 0 ||
      bait.offsetParent === null ||
      getComputedStyle(bait).display === 'none' ||
      getComputedStyle(bait).visibility === 'hidden';

    const jsBait = typeof window.__adblock_bait === "undefined";

    const finalDecision = detectionPassed || baitBlocked || jsBait;

    if (finalDecision) showBlockMessage();

    // Cleanup
    bait.remove();
    inlineScriptBait.remove();
  }, 1500);

  // Block message function
  function showBlockMessage() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: #fff;
      color: #000;
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: Arial, sans-serif;
    `;

    // Sad face rain animation
    const emojiContainer = document.createElement('div');
    emojiContainer.style.position = 'absolute';
    emojiContainer.style.top = '0';
    emojiContainer.style.left = '0';
    emojiContainer.style.width = '100%';
    emojiContainer.style.height = '100%';
    emojiContainer.style.pointerEvents = 'none';
    overlay.appendChild(emojiContainer);

    for (let i = 0; i < 30; i++) {
      const emoji = document.createElement('div');
      emoji.textContent = '😢';
      emoji.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}vw;
        top: -5vh;
        font-size: ${Math.random() * 30 + 20}px;
        animation: fall ${Math.random() * 3 + 2}s linear forwards;
      `;
      emojiContainer.appendChild(emoji);
    }

    // Add fall animation CSS
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

    // Message
    const title = document.createElement('h2');
    title.textContent = "😢 Ad Blocker Detected";

    const msg = document.createElement('p');
    msg.innerHTML = `
      Ads help us keep this service running and provide free content.<br>
      Please disable your ad blocker or open in Chrome without blockers.<br><br>
      We appreciate your support ❤️
    `;

    const refresh = document.createElement('button');
    refresh.textContent = "I’ve disabled Adblock, Refresh";
    refresh.style.cssText = `
      margin-top: 20px;
      padding: 10px 20px;
      background: #000;
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
