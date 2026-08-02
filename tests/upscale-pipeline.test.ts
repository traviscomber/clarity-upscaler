import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';

import { enhanceImage } from '../lib/n3uralia/processing.ts';
import { evaluateEnhancement } from '../lib/n3uralia/quality.ts';
import type { EnhancementStrategy } from '../lib/n3uralia/engine.ts';

const strategy: EnhancementStrategy = {
  name: 'Pipeline verification',
  model: 'Full Spectrum',
  scaleFactor: 4,
  preservationLevel: 0.85,
  qualityTarget: 'quality',
  presetId: 'full-spectrum',
  creativity: 0.35,
  resemblance: 0.6,
  denoise_steps: 18,
  sharpen: 2,
  dynamic: 12,
  tile_overlap: 48,
};

function verificationSvg(): Buffer {
  return Buffer.from(`
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#18202b"/>
          <stop offset="0.5" stop-color="#bd7c45"/>
          <stop offset="1" stop-color="#e7d6b6"/>
        </linearGradient>
        <pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 16h32M16 0v32" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="1024" height="1024" fill="url(#g)"/>
      <rect width="1024" height="1024" fill="url(#p)"/>
      <circle cx="512" cy="512" r="280" fill="none" stroke="#111111" stroke-width="11"/>
      <path d="M180 760L430 250L650 720L850 330" fill="none" stroke="#f7f1e7" stroke-width="9"/>
      <text x="512" y="535" text-anchor="middle" font-size="96" font-family="sans-serif" fill="#111111">CLAR1TY</text>
    </svg>
  `);
}

test('quality pipeline produces an exact 4096 x 4096 result from 1024 x 1024', async () => {
  const input = await sharp(verificationSvg())
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const inputMetadata = await sharp(input).metadata();
  assert.equal(inputMetadata.width, 1024);
  assert.equal(inputMetadata.height, 1024);

  const enhanced = await enhanceImage(input, strategy);
  const outputMetadata = await sharp(enhanced.buffer).metadata();

  assert.equal(enhanced.width, 4096);
  assert.equal(enhanced.height, 4096);
  assert.equal(outputMetadata.width, 4096);
  assert.equal(outputMetadata.height, 4096);
  assert.equal(enhanced.requestedScaleFactor, 4);
  assert.equal(enhanced.appliedScaleFactor, 4);
  assert.equal(enhanced.outputClamped, false);

  const losslessExport = await sharp(enhanced.buffer)
    .png({ compressionLevel: 4, adaptiveFiltering: true })
    .toBuffer();
  const exportMetadata = await sharp(losslessExport).metadata();

  assert.equal(exportMetadata.format, 'png');
  assert.equal(exportMetadata.width, 4096);
  assert.equal(exportMetadata.height, 4096);
  assert.ok(losslessExport.length > 0);

  const metrics = await evaluateEnhancement(input, losslessExport);
  assert.equal(metrics.method, 'n3uralia-local-v1');
  assert.ok(Number.isFinite(metrics.fidelity));
  assert.ok(Number.isFinite(metrics.detail));
  assert.ok(Number.isFinite(metrics.preservation));
  assert.ok(metrics.fidelity >= 0 && metrics.fidelity <= 1);
  assert.ok(metrics.detail >= 0 && metrics.detail <= 1);
  assert.ok(metrics.preservation >= 0 && metrics.preservation <= 1);
});
