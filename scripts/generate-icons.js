import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Write public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101d"/>
      <stop offset="50%" stop-color="#0e172a"/>
      <stop offset="100%" stop-color="#050811"/>
    </linearGradient>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <linearGradient id="canMetal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="25%" stop-color="#64748b"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="75%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect width="508" height="508" x="2" y="2" rx="110" fill="none" stroke="rgba(16, 185, 129, 0.3)" stroke-width="4"/>

  <!-- Glowing Can Silhouette -->
  <g transform="translate(156, 96)">
    <!-- Can Rim Top -->
    <ellipse cx="100" cy="24" rx="72" ry="16" fill="url(#canMetal)"/>
    <ellipse cx="100" cy="24" rx="60" ry="11" fill="#0f172a" stroke="#64748b" stroke-width="3"/>
    <ellipse cx="100" cy="24" rx="20" ry="6" fill="#334155"/>
    <rect x="94" y="16" width="12" height="18" rx="4" fill="#94a3b8"/>

    <!-- Can Body -->
    <path d="M 28 24 L 28 290 Q 28 316, 60 320 L 140 320 Q 172 316, 172 290 L 172 24 Z" fill="#090d16" stroke="rgba(148, 163, 184, 0.3)" stroke-width="3"/>

    <!-- Glowing Fluid Level Inside Can -->
    <path d="M 32 140 Q 64 128, 100 142 T 168 140 L 168 290 Q 168 314, 140 316 L 60 316 Q 32 314, 32 290 Z" fill="url(#neonGlow)" opacity="0.85" filter="url(#glow)"/>

    <!-- Fluid Sparkles / Fizz -->
    <circle cx="68" cy="190" r="5" fill="#ffffff" opacity="0.9"/>
    <circle cx="132" cy="165" r="4" fill="#ffffff" opacity="0.8"/>
    <circle cx="88" cy="230" r="6" fill="#ffffff" opacity="0.95"/>
    <circle cx="120" cy="250" r="4.5" fill="#ffffff" opacity="0.85"/>
    <circle cx="102" cy="180" r="3.5" fill="#ffffff" opacity="0.75"/>

    <!-- Pulse / Energy Bolt Line -->
    <path d="M 108 84 L 84 160 L 106 160 L 92 232 L 126 150 L 102 150 Z" fill="#ffffff" filter="url(#glow)"/>

    <!-- Can Bottom Chime -->
    <ellipse cx="100" cy="300" rx="66" ry="14" fill="none" stroke="#475569" stroke-width="3"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// Minimal pure Node PNG generator function: creates valid RGBA PNG buffer
function createPng(width, height, r, g, b, a) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // No filter

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate distance to center for a nice circular dark gradient with emerald energy can
      const cx = width / 2;
      const cy = height / 2;
      const dx = (x - cx) / (width / 2);
      const dy = (y - cy) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 0.88) {
        // Inside icon area
        const isCenterIcon = Math.abs(dx) < 0.35 && Math.abs(dy) < 0.55;
        if (isCenterIcon && dy > 0.0 && dy < 0.45) {
          // Emerald glowing fluid inside
          rawData[pxOffset] = 16;
          rawData[pxOffset + 1] = 185;
          rawData[pxOffset + 2] = 129;
          rawData[pxOffset + 3] = 255;
        } else if (isCenterIcon && dy <= 0.0 && dy > -0.45) {
          // Can upper body / cyan accent
          rawData[pxOffset] = 6;
          rawData[pxOffset + 1] = 182;
          rawData[pxOffset + 2] = 212;
          rawData[pxOffset + 3] = 255;
        } else {
          // Dark sleek card bg
          const grad = Math.min(1, dist);
          rawData[pxOffset] = Math.round(14 + (1 - grad) * 10);
          rawData[pxOffset + 1] = Math.round(22 + (1 - grad) * 16);
          rawData[pxOffset + 2] = Math.round(38 + (1 - grad) * 25);
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Outside rounded corners
        rawData[pxOffset] = 9;
        rawData[pxOffset + 1] = 13;
        rawData[pxOffset + 2] = 22;
        rawData[pxOffset + 3] = dist > 0.98 ? 0 : Math.round((1 - (dist - 0.88) / 0.1) * 255);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTable = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 4; i < 8 + len; i++) {
    crc = crcTable[(crc ^ chunk[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  chunk.writeUInt32BE(crc, 8 + len);

  return chunk;
}

let crcTableCache = null;
function getCrcTable() {
  if (crcTableCache) return crcTableCache;
  const cTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    cTable[n] = c;
  }
  crcTableCache = cTable;
  return cTable;
}

// Generate all standard PWA sizes
const png192 = createPng(192, 192);
const png512 = createPng(512, 512);
const appleTouch = createPng(180, 180);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('PWA icons created successfully in public/');
