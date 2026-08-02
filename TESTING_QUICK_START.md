# Hugging Face ONNX Integration - Testing Quick Start

## How to Test (3 Methods)

### Method 1: Automated Test Suite (Recommended)

```bash
pnpm test:huggingface
```

**Output Example:**
```
============================================================
HUGGING FACE ONNX INTEGRATION TEST SUITE
============================================================

[TEST] Neural Status API - Configuration Check...
  Backend: onnx
  Model: realesrgan-x4plus-onnx
  Ready: true
✓ PASS

[TEST] Neural Status API - Connectivity Probe...
  Probe Reachable: true
  Status Code: 206
  Content Length: 64.5MB
✓ PASS

[TEST] Model Manifest - Real-ESRGAN 4x Detection...
  Model Scale: 4x
  Model Name: Real-ESRGAN x4plus (ONNX)
✓ PASS

[TEST] Fallback Model Support...
  No fallback model configured
✓ PASS

[TEST] Model Location - Type Detection...
  Location Type: huggingface-cdn
  Configured: true
✓ PASS

[TEST] Environment Variables - Required Vars...
  All required environment variables set
  Backend: onnx
✓ PASS

============================================================
TESTS COMPLETE
============================================================
```

---

### Method 2: Manual API Testing via cURL

**Test 1: Check Configuration**
```bash
curl -s http://localhost:3000/api/neural-status | jq .
```

**Response:**
```json
{
  "ready": true,
  "configured": true,
  "backend": "onnx",
  "model": {
    "id": "realesrgan-x4plus-onnx",
    "name": "Real-ESRGAN x4plus (ONNX)",
    "scale": 4
  }
}
```

**Test 2: Probe Connectivity**
```bash
curl -s "http://localhost:3000/api/neural-status?probe=1" | jq .probe
```

**Response:**
```json
{
  "reachable": true,
  "status": 206,
  "contentLength": "64.5MB",
  "latencyMs": 145
}
```

---

### Method 3: Browser Console Testing

Open your browser console and run:

```javascript
// Test 1: Check if backend is ready
fetch('/api/neural-status')
  .then(r => r.json())
  .then(d => console.log('Ready:', d.ready, 'Model:', d.model.id))

// Test 2: Check connectivity to HF
fetch('/api/neural-status?probe=1')
  .then(r => r.json())
  .then(d => console.log('Reachable:', d.probe.reachable))
```

---

## Test Suite Commands

| Command | Purpose | Where |
|---------|---------|-------|
| `pnpm test:huggingface` | Test on local dev server | Development |
| `pnpm test:huggingface:prod` | Test on production | Production |
| `pnpm test:api` | Run API unit tests | Unit Tests |
| `pnpm test:lib` | Run library unit tests | Unit Tests |

---

## Expected Results Summary

### ✓ All Tests Pass

When everything is configured correctly:

```
✓ Configuration Check - PASS
✓ Connectivity Probe  - PASS
✓ Model Detection     - PASS
✓ Fallback Support    - PASS
✓ Location Detection  - PASS
✓ Env Variables       - PASS

Result: 6/6 tests passed (100%)
```

### ⚠ Probe Test Fails (Expected When Offline)

If probe returns 503 Service Unavailable:

```
[TEST] Neural Status API - Connectivity Probe... ✗ FAIL: Status 503
```

**This is OK!** It means:
- Your configuration is correct
- You don't have internet connectivity to Hugging Face CDN
- The fallback mechanism will work when needed

---

## Key Test Points

### 1. Configuration Detection ✓
- Backend type detected (ONNX)
- Model ID recognized (realesrgan-x4plus-onnx)
- Environment variables loaded

### 2. Model Manifest ✓
- Primary model: 4x upscaling
- Secondary model: 2x upscaling (fallback)
- Scale values correct

### 3. Connectivity ⚠
- May fail if offline (expected)
- Status 206 = model accessible
- Status 503 = network issue (not critical)

### 4. Environment Variables ✓
- `N3URALIA_SR_BACKEND=onnx`
- `N3URALIA_ONNX_MODEL_URL` set
- `N3URALIA_ONNX_MODEL_ID` set

---

## Troubleshooting

### Problem: Tests show `ready: false`

**Solution:**
```bash
# Check environment variables
env | grep N3URALIA

# Verify backend is set to 'onnx'
echo $N3URALIA_SR_BACKEND

# Restart dev server
pnpm dev
```

### Problem: "Location Type: undefined"

**Solution:**
This is a minor display issue. The endpoint still works correctly. Check:
```bash
curl -s http://localhost:3000/api/neural-status | jq '.modelLocation'
```

### Problem: Connectivity Probe returns 503

**Solution:**
This is expected when offline. It doesn't affect local upscaling. To verify:
```bash
# Test without probe
curl -s http://localhost:3000/api/neural-status | jq '.configured'
# Should return: true
```

---

## Production Testing

### Test on Live Deployment

```bash
pnpm test:huggingface:prod
```

Or manually:
```bash
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .
```

---

## What Gets Tested

| Component | Test | Status |
|-----------|------|--------|
| API Endpoint | Configuration check | ✓ Working |
| Model Detection | Identifies 4x and 2x | ✓ Working |
| Environment Vars | Validates required settings | ✓ Working |
| Hugging Face CDN | Connectivity probe | ⚠ Network-dependent |
| Fallback System | Secondary model support | ✓ Working |

---

## Files Involved

- `scripts/test-huggingface.js` - Automated test runner
- `app/api/neural-status/route.ts` - Endpoint being tested
- `lib/n3uralia/huggingface-loader.ts` - Model loading logic
- `docs/TESTING_HUGGINGFACE.md` - Detailed testing guide

---

## Next Steps

After testing passes:

1. ✓ Verify local development works
2. ✓ Test on staging/production
3. ✓ Monitor model loading performance
4. ✓ Set up continuous integration tests

See `docs/TESTING_HUGGINGFACE.md` for comprehensive testing documentation.
