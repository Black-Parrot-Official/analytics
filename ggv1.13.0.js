(function() {
  // Create full screen overlay styles
  const overlayStyles = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: white;
    color: #222;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
    z-index: 9999999;
    text-align: center;
    padding: 20px;
  `;

  // Sad face emoji for rain
  const sadEmoji = '😞';

  // Create overlay elements
  const overlay = document.createElement('div');
  overlay.style.cssText = overlayStyles;
  overlay.style.display = 'none';

  // Message container
  const message = document.createElement('div');
  message.style.marginBottom = '30px';
  message.style.fontSize = '1.4rem';
  message.style.lineHeight = '1.5';

  // Refresh button
  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = 'Refresh';
  refreshBtn.style.padding = '12px 24px';
  refreshBtn.style.fontSize = '1.1rem';
  refreshBtn.style.cursor = 'pointer';
  refreshBtn.style.border = '2px solid #555';
  refreshBtn.style.borderRadius = '6px';
  refreshBtn.style.background = 'white';
  refreshBtn.style.color = '#222';
  refreshBtn.style.transition = 'background 0.3s, color 0.3s';

  refreshBtn.onmouseenter = () => {
    refreshBtn.style.background = '#222';
    refreshBtn.style.color = 'white';
  };
  refreshBtn.onmouseleave = () => {
    refreshBtn.style.background = 'white';
    refreshBtn.style.color = '#222';
  };
  refreshBtn.onclick = () => location.reload();

  // Rain container
  const rainContainer = document.createElement('div');
  rainContainer.style.position = 'fixed';
  rainContainer.style.top = 0;
  rainContainer.style.left = 0;
  rainContainer.style.width = '100vw';
  rainContainer.style.height = '100vh';
  rainContainer.style.pointerEvents = 'none';
  rainContainer.style.overflow = 'hidden';
  rainContainer.style.zIndex = '10000000';

  overlay.appendChild(message);
  overlay.appendChild(refreshBtn);
  document.body.appendChild(overlay);
  document.body.appendChild(rainContainer);

  // Detect Brave Browser
  function isBrave() {
    return new Promise(resolve => {
      if (!navigator.brave) return resolve(false);
      navigator.brave.isBrave().then(resolve).catch(() => resolve(false));
    });
  }

  // Detect AdBlocker by loading Google Ads script
  function detectAdBlocker() {
    return new Promise(resolve => {
      const baitScript = document.createElement('script');
      baitScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      baitScript.async = true;

      let detected = false;

      baitScript.onerror = () => {
        detected = true;
        resolve(true);
      };
      baitScript.onload = () => {
        if (!detected) resolve(false);
      };

      document.head.appendChild(baitScript);

      // Timeout in case script neither loads nor errors (rare)
      setTimeout(() => {
        if (!detected) resolve(false);
      }, 3000);
    });
  }

  // Sad face rain animation
  function startSadFaceRain(duration = 5000) {
    const emojis = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.textContent = sadEmoji;
      span.style.position = 'absolute';
      span.style.fontSize = `${12 + Math.random() * 24}px`;
      span.style.left = `${Math.random() * 100}vw`;
      span.style.top = `${-10 - Math.random() * 20}vh`;
      span.style.opacity = '0.8';
      span.style.userSelect = 'none';
      span.style.pointerEvents = 'none';
      span.style.transition = 'transform 5s linear';
      rainContainer.appendChild(span);
      emojis.push(span);
    }

    // Animate downward
    emojis.forEach((emoji, i) => {
      setTimeout(() => {
        emoji.style.transform = `translateY(110vh)`;
      }, i * 100);
    });

    // Clean up after duration
    setTimeout(() => {
      emojis.forEach(e => rainContainer.removeChild(e));
    }, duration);
  }

  // Show the overlay with appropriate message
  async function showBlockMessage(isBraveDetected, isAdBlockDetected) {
    overlay.style.display = 'flex';
    startSadFaceRain();

    if (isBraveDetected) {
      message.innerHTML = `
        <p>We detected you're using the <strong>Brave Browser</strong>.<br>
        Please open this site in Chrome and disable any ad blockers for the best experience.</p>
        <p>Ads help us keep this service running and provide you free content.</p>
      `;
    } else if (isAdBlockDetected) {
      message.innerHTML = `
        <p>It looks like you are using an <strong>Ad Blocker</strong>.<br>
        Ads make it possible for us to run this server and provide content for free.<br>
        Please consider disabling your ad blocker for this site to continue.</p>
      `;
    } else {
      message.textContent = 'Access blocked. Please disable your ad blocker or switch to a supported browser.';
    }
  }

  // Remove overlay (unblock)
  function removeBlock() {
    overlay.style.display = 'none';
    rainContainer.innerHTML = '';
  }

  // Main check loop
  async function checkAndAct() {
    const braveDetected = await isBrave();
    const adBlockDetected = await detectAdBlocker();

    if (braveDetected || adBlockDetected) {
      showBlockMessage(braveDetected, adBlockDetected);
    } else {
      removeBlock();
    }
  }

  // Initial check
  checkAndAct();

  // Periodically check every 5 seconds in case user disables adblock or changes browser
  setInterval(checkAndAct, 5000);

  // Block F12 / devtools keyboard shortcuts (very basic, can be bypassed)
  window.addEventListener('keydown', function(e) {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      alert('Developer tools are disabled. Please disable ad blockers to access content.');
    }
  });

  // Disable right-click context menu to reduce inspect element access
  window.addEventListener('contextmenu', e => {
    e.preventDefault();
  });
})();
