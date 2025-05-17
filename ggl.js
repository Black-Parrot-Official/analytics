(function () {
  function triggerBlockerOverlay(msg) {
    if (document.getElementById('blocker-overlay')) return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes sadBounce {
        0%, 100% { transform: translateY(0); opacity: 0.2; }
        50% { transform: translateY(-20px); opacity: 0.6; }
      }
      #blocker-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #111;
        color: #fff;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: sans-serif;
        text-align: center;
        padding: 2rem;
        overflow: hidden;
      }
      #blocker-overlay .sad-face {
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 30vw;
        line-height: 1;
        transform: translate(-50%, -50%);
        user-select: none;
        pointer-events: none;
        animation: sadBounce 3s ease-in-out infinite;
        opacity: 0.3;
      }
      #blocker-overlay > div {
        position: relative;
        z-index: 2;
        max-width: 90vw;
      }
      #blocker-overlay button {
        margin-top: 1.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        cursor: pointer;
        background: #f33;
        color: #fff;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
      }
      #blocker-overlay button:hover {
        background: #c22;
      }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = 'blocker-overlay';

    div.innerHTML = `
      <span class="sad-face" aria-hidden="true">😞</span>
      <div>
        <h2>${msg}</h2>
        <p>Please disable your ad blocker or switch to Chrome.</p>
        <button onclick="location.reload()">Refresh</button>
      </div>
    `;
    document.body.appendChild(div);
  }

  function detectAdBlock() {
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -10000px; top: -1000px;';
    document.body.appendChild(bait);
    setTimeout(() => {
      const blocked = window.getComputedStyle(bait).display === 'none' || bait.offsetHeight === 0;
      bait.remove();
      if (blocked) triggerBlockerOverlay('Ad Blocker Detected!');
    }, 100);
  }

  function detectNetworkBlock() {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.onerror = () => triggerBlockerOverlay('Ad Blocker Detected (script blocked)!');
    document.body.appendChild(script);
  }

  function detectBrave() {
    if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
      navigator.brave.isBrave().then((isBrave) => {
        if (isBrave) triggerBlockerOverlay('Brave Browser Detected');
      });
    }
  }

  function blockDevTools() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key))) {
        e.preventDefault();
        triggerBlockerOverlay('Developer Tools are blocked');
      }
    });
    const devtools = /./;
    devtools.toString = function () {
      triggerBlockerOverlay('Developer Tools Detected');
    };
    console.log('%c', devtools);
  }

  window.addEventListener('load', () => {
    detectAdBlock();
    detectNetworkBlock();
    detectBrave();
    blockDevTools();
  });
})();
