(function () {
  const style = document.createElement("style");
  style.innerHTML = `
    #blockOverlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 999999;
      display: none;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      font-family: Arial, sans-serif;
      padding: 20px;
      text-align: center;
    }

    #blockOverlay button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 18px;
      background-color: #d9534f;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "blockOverlay";
  overlay.innerHTML = `
    <h2 id="blockMessage"></h2>
    <button onclick="location.reload()">Refresh Page</button>
  `;
  document.body.appendChild(overlay);

  function blockUser(message) {
    const overlay = document.getElementById("blockOverlay");
    const msg = document.getElementById("blockMessage");
    if (overlay && msg) {
      msg.innerText = message;
      overlay.style.display = 'flex';
    }
  }

  async function detectBrave() {
    return (navigator.brave && await navigator.brave.isBrave()) || false;
  }

  async function detectAdBlock() {
    return new Promise((resolve) => {
      let bait = document.createElement('div');
      bait.innerHTML = '&nbsp;';
      bait.className = 'adsbox';
      bait.style.position = 'absolute';
      bait.style.left = '-999px';
      bait.style.height = '50px';
      bait.style.width = '50px';
      document.body.appendChild(bait);

      window.setTimeout(function () {
        const detected =
          bait.offsetHeight === 0 || bait.offsetParent === null;
        document.body.removeChild(bait);
        resolve(detected);
      }, 150);
    });
  }

  async function detectAdUrlBlocking() {
    // Try loading a known ad server resource
    return new Promise((resolve) => {
      const testUrl = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      fetch(testUrl, { method: "HEAD", mode: "no-cors" })
        .then(() => resolve(false)) // Not blocked
        .catch(() => resolve(true)); // Blocked
    });
  }

  async function runChecks() {
    const isBrave = await detectBrave();
    const adBlockBait = await detectAdBlock();
    const adBlockUrl = await detectAdUrlBlocking();
    const isAdBlocker = adBlockBait || adBlockUrl;

    if (isBrave) {
      blockUser("Brave Browser Detected.\nPlease use Chrome and disable your ad blocker to access this site.");
      return;
    }

    if (isAdBlocker) {
      blockUser("Ad Blocker Detected.\nPlease disable your ad blocker and refresh the page.");
      return;
    }
  }

  runChecks();
})();
