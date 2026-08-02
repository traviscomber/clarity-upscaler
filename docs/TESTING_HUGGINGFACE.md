# Hugging Face ONNX Integration - Testing Guide

## Overview

This document provides comprehensive testing strategies for the Hugging Face ONNX model integration in Clarity Upscaler. Tests cover configuration verification, API endpoints, model detection, and end-to-end workflows.

---

## Quick Start - Run All Tests

### Automated Test Script

```bash
# Run the manual test suite
node scripts/test-huggingface.js

# Or with custom base URL
TEST_URL=https://clarity-upscaler.vercel.app node scripts/test-huggingface.js
```

### Expected Output

```
============================================================
HUGGING FACE ONNX INTEGRATION TEST SUITE
============================================================

[TEST] Neural Status API - Configuration Check... ✓ PASS
[TEST] Neural Status API - Connectivity Probe... ✓ PASS (or 503 if offline)
[TEST] Model Manifest - Real-ESRGAN 4x Detection... ✓ PASS
[TEST] Fallback Model Support... ✓ PASS
[TEST] Model Location - Type Detection... ✓ PASS
[TEST] Environment Variables - Required Vars... ✓ PASS

============================================================
TESTS COMPLETE
============================================================
```

---

## 1. API Testing

### Test 1.1: Neural Status Configuration Check

**Endpoint**: `GET /api/neural-status`

**Via cURL**:
```bash
curl -s http://localhost:3000/api/neural-status | jq .
```

**Expected Response**:
```json
{
  "ready": true,
  "configured": true,
  "backend": "onnx",
  "model": {
    "id": "realesrgan-x4plus-onnx",
    "name": "Real-ESRGAN x4plus (ONNX)",
    "scale": 4
  },
  "modelLocation": {
    "configured": true,
    "type": "huggingface-cdn"
  },
  "timestamp": "2024-08-02T..."
}
```

**Assertions**:
- ✓ `ready === true` (when configured)
- ✓ `backend === "onnx"`
- ✓ `model.scale === 4` (or 2 for secondary)
- ✓ `modelLocation.configured === true`

---

### Test 1.2: Connectivity Probe

**Endpoint**: `GET /api/neural-status?probe=1`

**Via cURL**:
```bash
curl -s "http://localhost:3000/api/neural-status?probe=1" | jq .probe
```

**Expected Response**:
```json
{
  "reachable": true,
  "status": 206,
  "contentLength": "64.5MB",
  "latencyMs": 145
}
```

**Notes**:
- Status 206 (Partial Content) is expected for model files
- 503 error is normal when offline or HF Hub is unreachable
- Latency indicates connection speed to Hugging Face CDN

---

## 2. Model Detection Tests

### Test 2.1: Verify Primary Model

```bash
curl -s http://localhost:3000/api/neural-status | jq '.model | {id, name, scale}'
```

**Expected Output**:
```json
{
  "id": "realesrgan-x4plus-onnx",
  "name": "Real-ESRGAN x4plus (ONNX)",
  "scale": 4
}
```

---

### Test 2.2: Check Fallback Model

```bash
curl -s http://localhost:3000/api/neural-status | jq '.fallbackModel'
```

**Expected Output** (if configured):
```json
{
  "id": "realesrgan-x2plus-onnx",
  "name": "Real-ESRGAN x2plus (ONNX)",
  "scale": 2,
  "available": true
}
```

---

## 3. Environment Variable Tests

### Test 3.1: Verify Required Env Vars

```bash
node -e "
const required = [
  'N3URALIA_SR_BACKEND',
  'N3URALIA_ONNX_MODEL_URL',
  'N3URALIA_ONNX_MODEL_ID'
];
required.forEach(v => {
  console.log(v + ': ' + (process.env[v] ? '✓' : '✗ MISSING'));
});
"
```

### Test 3.2: Validate Env Var Values

```bash
echo "Backend: $N3URALIA_SR_BACKEND"
echo "Model ID: $N3URALIA_ONNX_MODEL_ID"
echo "Model URL: ${N3URALIA_ONNX_MODEL_URL:0:80}..."
```

---

## 4. Integration Tests

### Test 4.1: End-to-End Upscaling Flow

1. **Upload Image** to `/studio`
2. **Verify** preset recommendation detected ONNX backend
3. **Check** model selector shows Real-ESRGAN 4x
4. **Trigger** upscaling with 4x scale
5. **Verify** processing uses ONNX backend (check neural-status during processing)

---

### Test 4.2: Browser Testing

**Manual Steps**:

1. Open https://localhost:3000/ in browser
2. Navigate to `/results`
3. Open DevTools → Network tab
4. Filter for "neural-status"
5. Verify request returns `ready: true`

**Console Test**:
```javascript
// In browser console
fetch('/api/neural-status').then(r => r.json()).then(d => {
  console.log('Backend Ready:', d.ready);
  console.log('Model:', d.model.id);
  console.log('Scale:', d.model.scale + 'x');
});
```

---

## 5. Performance Tests

### Test 5.1: API Response Time

```bash
time curl -s http://localhost:3000/api/neural-status > /dev/null
```

**Target**: < 100ms for configuration check

---

### Test 5.2: Probe Response Time

```bash
time curl -s "http://localhost:3000/api/neural-status?probe=1" > /dev/null
```

**Target**: < 500ms (varies with network)

---

## 6. Error Handling Tests

### Test 6.1: Missing Env Var

```bash
unset N3URALIA_ONNX_MODEL_URL
curl -s http://localhost:3000/api/neural-status | jq .error
```

**Expected**:
```json
"Model URL not configured"
```

---

### Test 6.2: Invalid Backend

```bash
N3URALIA_SR_BACKEND=invalid curl -s http://localhost:3000/api/neural-status | jq .
```

**Expected**: Returns fallback information

---

## 7. Production Deployment Tests

### Test 7.1: Deployed Endpoint

```bash
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq '.ready, .backend, .model.id'
```

---

### Test 7.2: Live Connectivity

```bash
curl -s "https://clarity-upscaler.vercel.app/api/neural-status?probe=1" | jq '.probe.reachable'
```

---

## 8. Troubleshooting

### Issue: `ready: false`

**Check**:
```bash
curl -s http://localhost:3000/api/neural-status | jq '.configured, .backend, .modelLocation.configured'
```

**Solutions**:
1. Verify env vars are set: `env | grep N3URALIA`
2. Restart dev server: `pnpm dev`
3. Check model URL is accessible

---

### Issue: Probe returns 503

**Reason**: Network connectivity to Hugging Face CDN is unavailable

**Options**:
1. Check internet connection
2. Verify firewall rules
3. Try different network
4. Use fallback model (2x) if available

---

### Issue: Model not detected

**Check**:
```bash
curl -s http://localhost:3000/api/neural-status | jq '.model'
```

**Solutions**:
1. Verify `N3URALIA_ONNX_MODEL_ID` is set
2. Ensure model ID matches manifest
3. Check spelling (case-sensitive)

---

## 9. Automated Testing

### Jest Tests

Run unit tests:
```bash
pnpm test -- __tests__/api/neural-status.test.ts
pnpm test -- __tests__/lib/huggingface-loader.test.ts
```

### CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Test Hugging Face Integration
  run: |
    node scripts/test-huggingface.js
    pnpm test
```

---

## 10. Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Configuration Check | ✓ Pass | Detects ONNX backend |
| Model Detection | ✓ Pass | Real-ESRGAN 4x recognized |
| Fallback Model | ✓ Pass | 2x variant available |
| Environment Vars | ✓ Pass | All required vars set |
| API Response | ✓ Pass | < 100ms |
| Connectivity Probe | ⚠ Varies | 503 when offline (expected) |

---

## Contact & Support

For issues or questions about testing:
- Check `/docs/HUGGINGFACE_INTEGRATION.md` for configuration
- Review `/app/api/neural-status/route.ts` for endpoint logic
- See `/lib/n3uralia/huggingface-loader.ts` for model loading
