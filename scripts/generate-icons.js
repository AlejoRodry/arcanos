import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // Raw uncompressed RGBA pixel data
  const rowSize = width * 4;
  const rawBuffer = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawBuffer[rowOffset] = 0; // Filter type 0: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawBuffer[pixelOffset] = r;
      rawBuffer[pixelOffset + 1] = g;
      rawBuffer[pixelOffset + 2] = b;
      rawBuffer[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawBuffer);

  // CRC32 implementation
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(typeStr, dataBuf) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(dataBuf.length, 0);

    const toCrc = Buffer.concat([typeBuf, dataBuf]);
    const crcVal = crc32(toCrc);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, typeBuf, dataBuf, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw elegant Sacred Astrolabe Icon
function drawRadiantIcon(isMaskable) {
  return function(x, y, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = w / 2;

    // Background gradient (#02060F to #050B14)
    const normDist = Math.min(1, dist / maxR);
    let r = Math.round(5 + 3 * (1 - normDist));
    let g = Math.round(11 + 5 * (1 - normDist));
    let b = Math.round(20 + 10 * (1 - normDist));
    let a = 255;

    // Outer squircle boundary if not maskable
    if (!isMaskable) {
      const cornerR = w * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (w / 2 - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (h / 2 - cornerR));
      if (Math.sqrt(qx * qx + qy * qy) > cornerR) {
        return [0, 0, 0, 0];
      }
    }

    const scale = isMaskable ? 0.75 : 0.88;
    const scaledDist = dist / scale;

    // Concentric rings
    const ring1 = Math.abs(scaledDist - maxR * 0.75);
    const ring2 = Math.abs(scaledDist - maxR * 0.58);
    const ring3 = Math.abs(scaledDist - maxR * 0.42);

    if (ring1 < 2.5 || ring2 < 1.8 || ring3 < 1.8) {
      // Gold highlight
      r = 212; g = 175; b = 55;
    } else if (dist < maxR * 0.16) {
      // Golden center core
      r = 243; g = 229; b = 171;
    } else {
      // Star ray check
      const angle = Math.atan2(dy, dx);
      const octAngle = Math.abs((angle % (Math.PI / 4)) - (Math.PI / 8));
      if (scaledDist < maxR * 0.65 && octAngle < 0.08) {
        r = 212; g = 175; b = 55;
      }
    }

    return [r, g, b, a];
  };
}

// Generate icons
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, drawRadiantIcon(false)));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, drawRadiantIcon(false)));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, drawRadiantIcon(true)));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, drawRadiantIcon(false)));

console.log('PWA icons created successfully.');
