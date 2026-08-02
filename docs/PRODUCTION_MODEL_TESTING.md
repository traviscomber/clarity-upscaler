# Production Model Testing Guide

## Overview

This guide covers testing the Hugging Face ONNX super-resolution model on production deployment at https://clarity-upscaler.vercel.app

## Architecture

- **API Endpoint**: `POST /api/enhance` - Processes images with enhancement strategy
- **Model Backend**: Hugging Face ONNX (Real-ESRGAN)
- **Status Endpoint**: `GET /api/neural-status` - Checks model configuration
- **Scale Factors**: 2x and 4x upscaling

## Quick Testing Methods

### Method 1: Web UI Testing (Easiest)

1. Go to: https://clarity-upscaler.vercel.app/studio
2. Click "Upload Image"
3. Select a test image (JPG, PNG)
4. Choose scale (2x or 4x)
5. Click "Enhance"
6. Wait for processing
7. Compare before/after

**Expected**: Image should be upscaled with sharp details

---

### Method 2: API cURL Testing

#### Check Model Status
```bash
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .
```

Expected output:
```json
{
  "ready": true,
  "configured": true,
  "backend": "onnx",
  "model": {
    "id": "realesrgan-x4plus-onnx",
    "scale": 4
  }
}
```

#### Send Image to Enhancement API

```bash
# Create a test image (1x1 red pixel PNG)
convert -size 100x100 xc:red test.png

# Send to API
curl -X POST https://clarity-upscaler.vercel.app/api/enhance \
  -F "image=@test.png" \
  -F 'strategy={"model":"realesrgan","scaleFactor":4,"qualityTarget":"balanced","preservationLevel":"medium","name":"test"}' \
  -o enhanced.png

# Check response headers
curl -X POST https://clarity-upscaler.vercel.app/api/enhance \
  -F "image=@test.png" \
  -F 'strategy={"model":"realesrgan","scaleFactor":4,"qualityTarget":"balanced","preservationLevel":"medium","name":"test"}' \
  -i -o /dev/null
```

Expected headers:
```
X-Engine-Version: 1.0.0
X-SR-Backend: onnx
X-SR-Neural: true
X-SR-Model-Id: realesrgan-x4plus-onnx
X-Scale-Factor: 4
X-Output-Width: 400
X-Output-Height: 400
```

---

### Method 3: JavaScript/Node Testing

#### Browser Console
```javascript
// Check model status
fetch('https://clarity-upscaler.vercel.app/api/neural-status')
  .then(r => r.json())
  .then(d => console.log('Model:', d.model?.id, 'Ready:', d.ready))

// Upload and enhance image
const formData = new FormData();
formData.append('image', imageFile); // File from input
formData.append('strategy', JSON.stringify({
  model: 'realesrgan',
  scaleFactor: 4,
  qualityTarget: 'balanced',
  preservationLevel: 'medium',
  name: 'test'
}));

fetch('https://clarity-upscaler.vercel.app/api/enhance', {
  method: 'POST',
  body: formData
})
  .then(r => {
    console.log('[v0] Response headers:');
    console.log('Backend:', r.headers.get('X-SR-Backend'));
    console.log('Model:', r.headers.get('X-SR-Model-Id'));
    console.log('Scale:', r.headers.get('X-Scale-Factor'));
    return r.blob();
  })
  .then(blob => {
    // Display enhanced image
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    document.body.appendChild(img);
  });
```

#### Node.js/API Testing
```javascript
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testEnhanceAPI() {
  const form = new FormData();
  form.append('image', fs.createReadStream('test.png'));
  form.append('strategy', JSON.stringify({
    model: 'realesrgan',
    scaleFactor: 4,
    qualityTarget: 'balanced',
    preservationLevel: 'medium',
    name: 'production-test'
  }));

  const response = await fetch(
    'https://clarity-upscaler.vercel.app/api/enhance',
    { method: 'POST', body: form }
  );

  console.log('[v0] Status:', response.status);
  console.log('[v0] Model:', response.headers.get('X-SR-Model-Id'));
  console.log('[v0] Backend:', response.headers.get('X-SR-Backend'));
  console.log('[v0] Processing time:', response.headers.get('X-Processing-Time'), 'ms');
  
  const buffer = await response.buffer();
  fs.writeFileSync('enhanced.png', buffer);
  console.log('[v0] Enhanced image saved: enhanced.png');
}

testEnhanceAPI();
```

---

### Method 4: Automated Test Script

Run the provided test script:

```bash
pnpm test:huggingface:prod
```

This tests:
- Model configuration detection
- Hugging Face CDN connectivity
- Environment variables
- API response format

---

## What to Look For

### Success Indicators

✓ **Model Detected**
- `X-SR-Model-Id` header shows `realesrgan-x4plus-onnx` or similar
- `X-SR-Backend` header shows `onnx`
- `X-SR-Neural` header shows `true`

✓ **Image Upscaled**
- Output dimensions are 2x or 4x input (based on scale factor)
- Image appears sharper and more detailed
- File format is PNG (lossless)

✓ **Processing Metrics**
- `X-Processing-Time` shows realistic time (typically 5-30 seconds depending on size)
- `X-Scale-Factor` matches requested scale
- `X-Enhancement-Time` shows model execution time

✓ **Quality Metrics**
- `X-Fidelity` score (0-100)
- `X-Detail` score (0-100)  
- `X-Preservation` score (0-100)
- All should be positive numbers

### Common Issues

**503 Service Unavailable**
- Hugging Face CDN temporarily down
- Wait 5 minutes and retry
- Check status: https://status.huggingface.co

**Model Not Found (404)**
- Model URL is incorrect
- Token might be invalid
- Check `/api/neural-status` endpoint

**Timeout (>120 seconds)**
- Image too large (max 50MB)
- Model inference is slow (normal for large images)
- Consider smaller scale factor

**401 Unauthorized**
- Invalid or expired Hugging Face token
- Regenerate token on HF settings
- Update `HUGGINGFACE_ACCESS_TOKEN` env var

**Memory Issues**
- Image resolution too high
- Reduce image size or scale factor
- Use 2x scale instead of 4x for large images

---

## Test Image Sizes

### Small Images (Quick Testing)
- 100x100 → 400x400 (4x scale)
- Processing: ~2-5 seconds
- Good for rapid testing

### Medium Images (Standard)
- 500x500 → 2000x2000 (4x scale)
- Processing: ~10-20 seconds
- Good for quality assessment

### Large Images (Full Test)
- 1000x1000 → 4000x4000 (4x scale)
- Processing: ~30-60 seconds
- Good for performance testing

---

## Production Monitoring

### Health Check Endpoint

```bash
# Check every minute
watch -n 60 'curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .'
```

### Monitor Response Times

```bash
# Time a full enhancement request
time curl -X POST https://clarity-upscaler.vercel.app/api/enhance \
  -F "image=@test.png" \
  -F 'strategy={"model":"realesrgan","scaleFactor":4,"qualityTarget":"balanced","preservationLevel":"medium","name":"test"}' \
  -o enhanced.png
```

### Response Headers to Monitor

Key headers for debugging and monitoring:
- `X-SR-Backend` - Should be "onnx"
- `X-SR-Neural` - Should be "true"
- `X-SR-Model-Id` - Should show model name
- `X-Processing-Time` - Monitor for slowdowns
- `X-SR-Fallback-Reason` - Should be empty/undefined

---

## Batch Testing

### Test Multiple Images

```bash
#!/bin/bash

IMAGES=("test1.png" "test2.jpg" "test3.png")
RESULTS="test_results_$(date +%s)"
mkdir -p "$RESULTS"

for img in "${IMAGES[@]}"; do
  echo "Testing: $img"
  
  curl -X POST https://clarity-upscaler.vercel.app/api/enhance \
    -F "image=@$img" \
    -F 'strategy={"model":"realesrgan","scaleFactor":4,"qualityTarget":"balanced","preservationLevel":"medium","name":"batch-test"}' \
    -o "$RESULTS/enhanced_$img" \
    -w "\nTime: %{time_total}s\nStatus: %{http_code}\n\n"
done

echo "Results saved to: $RESULTS"
```

---

## Performance Baseline

Expected metrics on production:

| Image Size | Scale | Model | Time | Status |
|-----------|-------|-------|------|--------|
| 100x100 | 4x | ONNX 4x+ | 2-5s | ✓ |
| 500x500 | 4x | ONNX 4x+ | 10-20s | ✓ |
| 1000x1000 | 4x | ONNX 4x+ | 30-60s | ✓ |
| 500x500 | 2x | ONNX 2x | 5-10s | ✓ |
| 1000x1000 | 2x | ONNX 2x | 15-30s | ✓ |

---

## Troubleshooting

### If Model Is Not Loading

1. Check endpoint:
   ```bash
   curl https://clarity-upscaler.vercel.app/api/neural-status
   ```

2. Check environment variables in Vercel:
   - Settings → Environment Variables
   - Verify `HUGGINGFACE_ACCESS_TOKEN` is set
   - Verify `N3URALIA_ONNX_MODEL_URL` is correct

3. Check Hugging Face Hub status:
   - Go to https://status.huggingface.co
   - Look for any incidents

### If Enhancement Fails

1. Verify image format:
   ```bash
   file test.png  # Should show: "PNG image data"
   ```

2. Check image size:
   ```bash
   identify test.png  # Show dimensions and size
   ```

3. Try smaller image:
   ```bash
   convert test.png -resize 50% test_small.png
   ```

4. Check error response:
   ```bash
   curl -v -X POST https://clarity-upscaler.vercel.app/api/enhance \
     -F "image=@test.png" \
     -F 'strategy={...}'
   ```

### If Response Times Are Slow

1. Check processing time header:
   ```bash
   curl -I -X POST https://clarity-upscaler.vercel.app/api/enhance \
     -F "image=@test.png" \
     -F 'strategy={...}' | grep X-Processing-Time
   ```

2. Consider factors:
   - Image size (larger = slower)
   - Scale factor (4x = slower than 2x)
   - Vercel cold start (first request after deploy)
   - HF CDN latency (geographic location)

---

## Next Steps

1. ✓ Test with web UI
2. ✓ Test with API (cURL)
3. ✓ Test with different image sizes
4. ✓ Monitor response times
5. ✓ Set up production monitoring
6. ✓ Document baseline metrics

