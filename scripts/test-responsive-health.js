const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   NAVIGO NEPAL — RESPONSIVE HEALTH AUDIT SCRIPT    ');
console.log('====================================================\n');

let totalWarnings = 0;
let totalPassed = 0;

// 1. Audit all HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log(`Auditing ${htmlFiles.length} HTML pages...`);

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check viewport meta
  if (!content.includes('viewport-fit=cover')) {
    console.warn(`[WARN] ${file} is missing viewport-fit=cover in <meta name="viewport">`);
    totalWarnings++;
  } else {
    totalPassed++;
  }

  // Check 100vw in inline styles
  const inline100vw = content.match(/style="[^"]*100vw[^"]*"/g);
  if (inline100vw) {
    console.warn(`[WARN] ${file} contains 100vw in inline styles: ${inline100vw.join(', ')}`);
    totalWarnings++;
  }

  // Check unoptimized images
  const imgTags = content.match(/<img[^>]*>/g) || [];
  imgTags.forEach(img => {
    if (!img.includes('decoding=')) {
      console.warn(`[INFO] ${file}: <img> missing decoding: ${img.slice(0, 60)}...`);
    }
    if (!img.includes('loading=')) {
      console.warn(`[INFO] ${file}: <img> missing loading attribute: ${img.slice(0, 60)}...`);
    }
  });
});

console.log(`\nAuditing CSS stylesheets in css/ ...`);
const cssDir = path.join(rootDir, 'css');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
  const filePath = path.join(cssDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for 100vw usage
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('100vw') && !line.includes('/*') && !line.includes('max-width')) {
      console.warn(`[NOTE] ${file}:${idx + 1} uses 100vw: ${line.trim()}`);
    }
  });

  // Check safe area variables/rules
  if (file === 'style.css') {
    if (content.includes('env(safe-area-inset-top')) {
      console.log(`[PASS] css/style.css includes safe-area-inset support`);
      totalPassed++;
    } else {
      console.warn(`[WARN] css/style.css is missing safe-area-inset support`);
      totalWarnings++;
    }

    if (content.includes('font-size: 16px !important')) {
      console.log(`[PASS] css/style.css enforces 16px mobile input zoom prevention`);
      totalPassed++;
    } else {
      console.warn(`[WARN] css/style.css missing mobile input 16px prevention`);
      totalWarnings++;
    }
  }
});

console.log(`\nAuditing id-cards/id-card-styles.css ...`);
const idCardCss = path.join(rootDir, 'id-cards', 'id-card-styles.css');
if (fs.existsSync(idCardCss)) {
  const content = fs.readFileSync(idCardCss, 'utf8');
  if (content.includes('env(safe-area-inset-top')) {
    console.log(`[PASS] id-card-styles.css includes safe-area support`);
    totalPassed++;
  }
  if (content.includes('@media (max-width: 767.98px)')) {
    console.log(`[PASS] id-card-styles.css includes mobile media queries`);
    totalPassed++;
  }
}

console.log(`\n====================================================`);
console.log(`Audit Summary: Passed checks: ${totalPassed}, Warnings: ${totalWarnings}`);
console.log('====================================================');
