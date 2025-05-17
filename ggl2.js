(function () {
  let overlay;

  function createOverlay(msg) {
    if (overlay) return;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes rainSadFaces {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
      }
      #blocker-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #fff;
        color: #222;
        z-index: 99999999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        padding: 2rem;
        overflow: hidden;
        user-select: none;
      }
      #blocker-overlay > div {
        position: relative;
        z-index: 10;
        max-width: 90vw;
      }
      #blocker-overlay h2 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }
      #blocker-overlay p {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
      }
      #blocker-overlay button {
        padding: 0.6rem 1.2rem;
        font-size: 1.1rem;
        cursor: pointer;
        background: #222;
        color: #fff;
        border: none;
        border-radius: 6px;
        transition: background-color 0.3s ease;
      }
      #blocker-overlay button:hover {
        background: #555;
      }
      .sad-face-rain {
        pointer-events: none;
        position: fixed;
        top: -5vh;
        font-size: 2.5rem;
        user-select: none;
        animation-name: rainSadFaces;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'blocker-overlay';

    overlay.innerHTML = `
      <div>
        <h2>${msg}</h2>
        <p>Please disable your ad blocker or switch to Chrome.</p>
        <button id="refreshBtn">Retry</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Create raining sad faces for ~5 seconds
    const rainCount = 30;
    for (let i = 0; i < rainCount; i++) {
      const span = document.createElement('span');
      span.className = 'sad-face-rain';
      span.textContent = '😞';
      // random horizontal position between 0 and 100vw
      span.style.left = (Math.random() * 100) + 'vw';
      // random animation duration between 3 and 6 seconds
      span.style.animationDuration = (3 + Math.random() * 3) + 's';
      // random delay so they don't all fall at the same time
      span.style.animationDelay = (Math.random() * 5) + 's';
      overlay.appendChild(span);
    }

    document.getElementById('refreshBtn').addEventListener('click', () => {
      removeOverlay();
      runChecks();
    });
  }

  function removeOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function detectAdBlock(callback) {
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -10000px; top: -1000px;';
    document.body.appendChild(bait);
    setTimeout(() => {
      const blocked = window.getComputedStyle(bait).display === 'none' || bait.offsetHeight === 0;
      bait.remove();
      callback(blocked);
    }, 100);
  }

  function detectNetworkBlock(callback) {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.onerror = () => callback(true);
    script.onload = () => callback(false);
    document.body.appendChild(script);
  }

  function detectBrave(callback) {
    if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
      navigator.brave.isBrave().then(isBrave => callback(isBrave)).catch(() => callback(false));
    } else {
      callback(false);
    }
  }

  function blockDevTools() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key))) {
        e.preventDefault();
        createOverlay('Developer Tools are blocked');
      }
    });
    const devtools = /./;
    devtools.toString = function () {
      createOverlay('Developer Tools Detected');
    };
    console.log('%c', devtools);
  }

  function runChecks() {
    removeOverlay();
    detectBrave(isBrave => {
      if (isBrave) {
        createOverlay('Brave Browser Detected');
        return;
      }
      detectAdBlock(isBlocked => {
        if (isBlocked) {
          createOverlay('Ad Blocker Detected!');
          return;
        }
        detectNetworkBlock(netBlocked => {
          if (netBlocked) {
            createOverlay('Ad Blocker Detected (script blocked)!');
            return;
          }
          removeOverlay(); // No blocker detected, remove overlay
        });
      });
    });
  }

  window.addEventListener('load', () => {
    runChecks();
    blockDevTools();
  });
})();
