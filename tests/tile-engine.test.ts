import assert from 'node:assert/strict';
import test from 'node:test';

import { checksum } from '../lib/n3uralia/benchmark-recorder.ts';
import {
  createTilePlan,
  recommendTileOptions,
  shouldUseTiles,
} from '../lib/n3uralia/tile-engine.ts';

test('single-tile plan covers a small image exactly', () => {
  const plan = createTilePlan(640, 480, { tileSize: 1024, overlap: 64 });

  assert.equal(plan.rows, 1);
  assert.equal(plan.columns, 1);
  assert.equal(plan.tiles.length, 1);
  assert.deepEqual(plan.tiles[0], {
    index: 0,
    row: 0,
    column: 0,
    left: 0,
    top: 0,
    width: 640,
    height: 480,
    coreLeft: 0,
    coreTop: 0,
    coreWidth: 640,
    coreHeight: 480,
    cropLeft: 0,
    cropTop: 0,
  });
});

test('multi-tile plan covers every source pixel once through core regions', () => {
  const width = 5000;
  const height = 3000;
  const plan = createTilePlan(width, height, { tileSize: 1024, overlap: 64 });

  let coveredPixels = 0;
  for (const tile of plan.tiles) {
    assert.ok(tile.left >= 0);
    assert.ok(tile.top >= 0);
    assert.ok(tile.left + tile.width <= width);
    assert.ok(tile.top + tile.height <= height);
    assert.ok(tile.cropLeft >= 0);
    assert.ok(tile.cropTop >= 0);
    coveredPixels += tile.coreWidth * tile.coreHeight;
  }

  assert.equal(coveredPixels, width * height);
  assert.equal(plan.tiles.length, plan.rows * plan.columns);
});

test('invalid overlap is rejected', () => {
  assert.throws(
    () => createTilePlan(1000, 1000, { tileSize: 512, overlap: 256 }),
    /less than half/,
  );
});

test('tile recommendation adapts to constrained memory', () => {
  assert.deepEqual(recommendTileOptions(12000, 12000, 256), {
    tileSize: 512,
    overlap: 32,
  });
  assert.deepEqual(recommendTileOptions(12000, 12000, 2048), {
    tileSize: 768,
    overlap: 48,
  });
});

test('tile threshold is deterministic', () => {
  assert.equal(shouldUseTiles(4000, 4000, 16_000_000), false);
  assert.equal(shouldUseTiles(4001, 4000, 16_000_000), true);
});

test('benchmark checksums are stable and content-sensitive', () => {
  const first = checksum(Buffer.from('n3uralia'));
  const second = checksum(Buffer.from('n3uralia'));
  const different = checksum(Buffer.from('clar1ty'));

  assert.equal(first, second);
  assert.notEqual(first, different);
  assert.match(first, /^[a-f0-9]{64}$/);
});
