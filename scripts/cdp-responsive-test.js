const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const PORT = 3009;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// 1. Simple static file server
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0].split('#')[0];
  if (cleanUrl === '/') cleanUrl = '/index.html';
  const filePath = path.join(rootDir, cleanUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

const TARGET_DEVICES = [
  { name: 'Small Mobile', width: 320, height: 568 },
  { name: 'Mobile 360', width: 360, height: 640 },
  { name: 'Mobile 375', width: 375, height: 667 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 393', width: 393, height: 873 },
  { name: 'Large Mobile 414', width: 414, height: 896 },
  { name: 'Large Mobile 430', width: 430, height: 932 },
  { name: 'Tablet 600', width: 600, height: 800 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet 820', width: 820, height: 1180 },
  { name: 'Tablet 1024', width: 1024, height: 1366 },
  { name: 'Laptop 1280', width: 1280, height: 720 },
  { name: 'Laptop 1366', width: 1366, height: 768 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
  { name: 'Desktop 1536', width: 1536, height: 864 },
  { name: 'Large Desktop', width: 1920, height: 1080 },
  { name: 'Ultrawide', width: 2560, height: 1080 }
];

const PAGES_TO_TEST = [
  'index.html',
  'programs.html',
  'our-story.html',
  'team.html',
  'discord-workshop.html',
  'donate.html',
  'join.html',
  'verify.html',
  'admin.html',
  '404.html'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 0;
    this.callbacks = new Map();
    this.eventListeners = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method && this.eventListeners.has(msg.method)) {
        this.eventListeners.get(msg.method)(msg.params);
      }
    };
  }

  ready() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, handler) {
    this.eventListeners.set(event, handler);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Test web server running on port ${PORT}`);

  const userDataDir = path.join(rootDir, '.edge-test-profile');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    '--remote-debugging-port=9222',
    'about:blank'
  ]);

  let connected = false;
  let targetWsUrl = null;

  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const targets = await httpGetJson('http://127.0.0.1:9222/json/list');
      if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) {
        targetWsUrl = targets[0].webSocketDebuggerUrl;
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    console.error('Failed to connect to Edge DevTools Protocol');
    edgeProc.kill();
    server.close();
    process.exit(1);
  }

  console.log('Connected to Edge CDP. Starting responsive matrix testing...\n');

  const cdp = new CDPClient(targetWsUrl);
  await cdp.ready();
  await cdp.send('Page.enable');

  const matrixResults = [];
  let totalTests = 0;
  let totalOverflowBugs = 0;

  for (const device of TARGET_DEVICES) {
    console.log(`Testing Device: ${device.name} (${device.width} × ${device.height})`);
    
    // Set screen size
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: device.width,
      height: device.height,
      deviceScaleFactor: 1,
      mobile: device.width <= 768
    });

    let devicePass = true;

    for (const page of PAGES_TO_TEST) {
      totalTests++;
      const url = `http://localhost:${PORT}/${page}`;
      
      let loadFired = false;
      const loadPromise = new Promise(resolve => {
        cdp.on('Page.loadEventFired', () => {
          loadFired = true;
          resolve();
        });
      });

      await cdp.send('Page.navigate', { url });
      await Promise.race([loadPromise, sleep(1500)]);
      await sleep(300); // Wait for micro-animations/layouts to settle

      // Run overflow check
      const checkScript = `
        (() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const overflowX = docW - winW;
          
          let culprit = null;
          if (overflowX > 1.5) {
            let maxRight = winW;
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
              const r = el.getBoundingClientRect();
              if (r.right > maxRight + 2) {
                maxRight = r.right;
                culprit = {
                  tag: el.tagName.toLowerCase(),
                  id: el.id,
                  class: (el.className && typeof el.className === 'string') ? el.className.slice(0, 40) : '',
                  right: Math.round(r.right),
                  width: Math.round(r.width)
                };
              }
            }
          }

          // Check mobile navigation button
          const hamburger = document.querySelector('#hamburger, #mobileMenuToggle, .hamburger');
          const hamburgerVisible = hamburger ? (window.getComputedStyle(hamburger).display !== 'none') : false;

          return {
            docW,
            winW,
            overflowX: Math.max(0, overflowX),
            culprit,
            hamburgerVisible
          };
        })()
      `;

      const evalRes = await cdp.send('Runtime.evaluate', {
        expression: checkScript,
        returnByValue: true
      });

      const res = evalRes.result ? evalRes.result.value : null;
      if (res && res.overflowX > 1.5) {
        devicePass = false;
        totalOverflowBugs++;
        console.error(`  ❌ [OVERFLOW] ${page} at ${device.width}px! Overflow by ${res.overflowX.toFixed(1)}px (Doc: ${res.docW}px, Win: ${res.winW}px). Culprit:`, res.culprit);
      }
    }

    matrixResults.push({
      device: device.name,
      width: device.width,
      height: device.height,
      status: devicePass ? 'PASS' : 'FAIL'
    });

    if (devicePass) {
      console.log(`  ✅ All ${PAGES_TO_TEST.length} pages passed with ZERO overflow!\n`);
    }
  }

  // Teardown
  cdp.close();
  edgeProc.kill();
  server.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('====================================================');
  console.log('                FINAL QA MATRIX RESULTS             ');
  console.log('====================================================');
  console.table(matrixResults);
  console.log(`Total tests evaluated: ${totalTests}`);
  console.log(`Total overflow issues: ${totalOverflowBugs}`);

  if (totalOverflowBugs === 0) {
    console.log('\n🎉 ALL VIEWPORTS 320px - 2560px ARE 100% RESPONSIVE AND ZERO OVERFLOW!');
  } else {
    process.exitCode = 1;
  }
}

run().catch(err => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
