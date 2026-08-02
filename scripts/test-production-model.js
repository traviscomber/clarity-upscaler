#!/usr/bin/env node

/**
 * Production Model Testing Script
 * Tests the Hugging Face ONNX model on production deployment
 * 
 * Usage:
 *   node scripts/test-production-model.js [image-path] [scale-factor]
 * 
 * Examples:
 *   node scripts/test-production-model.js test.png 4
 *   node scripts/test-production-model.js ~/Photos/example.jpg 2
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PRODUCTION_URL = 'https://clarity-upscaler.vercel.app';
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            PRODUCTION MODEL TESTING SCRIPT                     ║
║                                                                ║
║  Usage: node scripts/test-production-model.js <image> [scale] ║
║                                                                ║
║  Examples:                                                     ║
║    node scripts/test-production-model.js test.png             ║
║    node scripts/test-production-model.js test.png 4           ║
║    node scripts/test-production-model.js ~/photo.jpg 2        ║
╚════════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

const imagePath = path.resolve(args[0]);
const scaleFactor = parseInt(args[1] || '4', 10);

if (!fs.existsSync(imagePath)) {
  console.error(`[ERROR] Image not found: ${imagePath}`);
  process.exit(1);
}

async function testProduction() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('PRODUCTION MODEL TEST');
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Check model status
  console.log('[STEP 1] Checking model status...');
  try {
    const statusUrl = new URL('/api/neural-status', PRODUCTION_URL);
    const statusResponse = await fetch(statusUrl);
    const statusData = await statusResponse.json();

    console.log(`  Backend: ${statusData.backend}`);
    console.log(`  Model: ${statusData.model?.id}`);
    console.log(`  Ready: ${statusData.ready}`);
    
    if (!statusData.ready) {
      console.error('  [ERROR] Model is not ready');
      process.exit(1);
    }
    console.log('  ✓ Status check passed\n');
  } catch (error) {
    console.error(`  [ERROR] Failed to check status: ${error.message}`);
    process.exit(1);
  }

  // Step 2: Prepare image
  console.log('[STEP 2] Preparing image...');
  const imageBuffer = fs.readFileSync(imagePath);
  const imageName = path.basename(imagePath);
  const imageSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
  
  console.log(`  File: ${imageName}`);
  console.log(`  Size: ${imageSizeMB} MB`);
  console.log(`  ✓ Image prepared\n`);

  // Step 3: Send to enhancement API
  console.log('[STEP 3] Sending to enhancement API...');
  console.log(`  URL: POST ${PRODUCTION_URL}/api/enhance`);
  console.log(`  Scale factor: ${scaleFactor}x`);

  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, imageName);
    formData.append('strategy', JSON.stringify({
      model: 'realesrgan',
      scaleFactor: scaleFactor,
      qualityTarget: 'balanced',
      preservationLevel: 'medium',
      name: 'production-test'
    }));

    const enhanceUrl = new URL('/api/enhance', PRODUCTION_URL);
    const enhanceResponse = await fetch(enhanceUrl, {
      method: 'POST',
      body: formData
    });

    const enhanceTime = Date.now() - startTime;
    const enhanceBuffer = await enhanceResponse.arrayBuffer();

    console.log(`  Status: ${enhanceResponse.status}`);
    console.log(`  Time: ${(enhanceTime / 1000).toFixed(2)}s`);
    console.log(`  Output size: ${(enhanceBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // Step 4: Extract and display response headers
    console.log('\n[STEP 4] Response headers:');
    const headers = [
      'X-SR-Backend',
      'X-SR-Neural',
      'X-SR-Model-Id',
      'X-Scale-Factor',
      'X-Output-Width',
      'X-Output-Height',
      'X-Processing-Time',
      'X-Enhancement-Time',
      'X-Engine-Version',
      'X-Fidelity',
      'X-Detail',
      'X-Preservation'
    ];

    headers.forEach(header => {
      const value = enhanceResponse.headers.get(header);
      if (value) {
        console.log(`  ${header}: ${value}`);
      }
    });

    // Step 5: Save enhanced image
    console.log('\n[STEP 5] Saving enhanced image...');
    const outputPath = `enhanced_${Date.now()}_${scaleFactor}x.png`;
    fs.writeFileSync(outputPath, Buffer.from(enhanceBuffer));
    console.log(`  ✓ Saved: ${outputPath}\n`);

    // Summary
    console.log(`${'='.repeat(60)}`);
    console.log('✓ PRODUCTION TEST SUCCESSFUL');
    console.log(`${'='.repeat(60)}\n`);

    console.log('Summary:');
    console.log(`  Input: ${imageName} (${imageSizeMB}MB)`);
    console.log(`  Scale: ${scaleFactor}x`);
    console.log(`  Output: ${outputPath}`);
    console.log(`  Model: ${enhanceResponse.headers.get('X-SR-Model-Id')}`);
    console.log(`  Backend: ${enhanceResponse.headers.get('X-SR-Backend')}`);
    console.log(`  Total time: ${(enhanceTime / 1000).toFixed(2)}s\n`);

  } catch (error) {
    console.error(`\n  [ERROR] Enhancement failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle both Node.js fetch and browser fetch
if (typeof fetch === 'undefined') {
  // Node.js < 18, use node-fetch
  console.error('[ERROR] Node.js 18+ with built-in fetch is required');
  process.exit(1);
}

testProduction().catch(error => {
  console.error(`\n[FATAL] ${error.message}`);
  process.exit(1);
});
