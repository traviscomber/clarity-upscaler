#!/usr/bin/env node

/**
 * Hugging Face ONNX Integration Manual Test Script
 * 
 * Tests:
 * 1. Neural Status API - Configuration check
 * 2. Neural Status API - With connectivity probe
 * 3. Model manifest validation
 * 4. HF model accessibility
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

console.log(`\n${'='.repeat(60)}`);
console.log('HUGGING FACE ONNX INTEGRATION TEST SUITE');
console.log(`${'='.repeat(60)}\n`);

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || { 'Content-Type': 'application/json' },
      timeout: 10000,
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function test(name, fn) {
  process.stdout.write(`\n[TEST] ${name}... `);
  try {
    await fn();
    console.log('✓ PASS');
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
  }
}

async function runTests() {
  // Test 1: Neural Status API - Basic Configuration
  await test('Neural Status API - Configuration Check', async () => {
    const response = await makeRequest('/api/neural-status');
    
    if (response.status !== 200) {
      throw new Error(`Status ${response.status}, expected 200`);
    }

    const data = response.data;
    if (!data.configured) {
      throw new Error('Backend not configured');
    }

    if (!data.backend) {
      throw new Error('Backend type not detected');
    }

    console.log(`\n  Backend: ${data.backend}`);
    console.log(`  Model: ${data.model?.id || 'none'}`);
    console.log(`  Ready: ${data.ready}`);
  });

  // Test 2: Neural Status API - With Probe
  await test('Neural Status API - Connectivity Probe', async () => {
    const response = await makeRequest('/api/neural-status?probe=1');
    
    if (response.status !== 200) {
      throw new Error(`Status ${response.status}, expected 200`);
    }

    const data = response.data;
    if (!data.probe) {
      throw new Error('Probe data not returned');
    }

    console.log(`\n  Probe Reachable: ${data.probe.reachable}`);
    console.log(`  Status Code: ${data.probe.status}`);
    console.log(`  Content Length: ${data.probe.contentLength || 'unknown'}`);
  });

  // Test 3: Model Manifest
  await test('Model Manifest - Real-ESRGAN 4x Detection', async () => {
    const response = await makeRequest('/api/neural-status');
    const data = response.data;

    if (!data.model) {
      throw new Error('Model not detected');
    }

    if (data.model.scale !== 4 && data.model.scale !== 2) {
      throw new Error(`Invalid scale: ${data.model.scale}`);
    }

    console.log(`\n  Model Scale: ${data.model.scale}x`);
    console.log(`  Model Name: ${data.model.name}`);
  });

  // Test 4: Fallback Model Support
  await test('Fallback Model Support', async () => {
    const response = await makeRequest('/api/neural-status');
    const data = response.data;

    if (data.fallbackModel) {
      console.log(`\n  Fallback Available: ${data.fallbackModel.id}`);
      console.log(`  Fallback Scale: ${data.fallbackModel.scale}x`);
    } else {
      console.log(`\n  No fallback model configured`);
    }
  });

  // Test 5: Model Location Validation
  await test('Model Location - Type Detection', async () => {
    const response = await makeRequest('/api/neural-status');
    const data = response.data;

    if (!data.modelLocation) {
      throw new Error('Model location data missing');
    }

    console.log(`\n  Location Type: ${data.modelLocation.type}`);
    console.log(`  Configured: ${data.modelLocation.configured}`);
    
    if (data.modelLocation.type === 'huggingface-cdn') {
      console.log(`  URL: ${data.modelLocation.url?.substring(0, 80)}...`);
    }
  });

  // Test 6: Environment Variables
  await test('Environment Variables - Required Vars', async () => {
    const requiredVars = [
      'N3URALIA_SR_BACKEND',
      'N3URALIA_ONNX_MODEL_URL',
    ];

    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing env vars: ${missingVars.join(', ')}`);
    }

    console.log(`\n  All required environment variables set`);
    console.log(`  Backend: ${process.env.N3URALIA_SR_BACKEND}`);
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log('TESTS COMPLETE');
  console.log(`${'='.repeat(60)}\n`);
}

// Run tests
runTests().catch(error => {
  console.error('\nFATAL ERROR:', error.message);
  process.exit(1);
});
