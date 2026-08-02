# Production Model Testing - Quick Reference

## 4 Ways to Test the ONNX Model

### 1. Web UI (Easiest) - 30 seconds

```
1. Go to: https://clarity-upscaler.vercel.app/studio
2. Upload image
3. Click "Enhance"
4. See before/after comparison
```

### 2. API Status Check - 5 seconds

```bash
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .

Expected:
{
  "ready": true,
  "backend": "onnx",
  "model": {"id": "realesrgan-x4plus-onnx", "scale": 4}
}
```

### 3. Test with Script - 2 minutes

```bash
# Quick test with example image
node scripts/test-production-model.js test.png 4

# Output:
# ✓ Checks model status
# ✓ Uploads test image
# ✓ Gets enhanced result
# ✓ Saves: enhanced_TIMESTAMP_4x.png
```

Or use npm script:
```bash
pnpm test:production:model test.png 4
```

### 4. API Direct Testing - 1 minute

```bash
# Download or create test image
convert -size 100x100 xc:red test.png

# Send to API
curl -X POST https://clarity-upscaler.vercel.app/api/enhance \
  -F "image=@test.png" \
  -F 'strategy={"model":"realesrgan","scaleFactor":4,"qualityTarget":"balanced","preservationLevel":"medium"}' \
  -o enhanced.png \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"

# Check the response
identify enhanced.png  # Should be 400x400 (100x100 * 4)
```

---

## What Success Looks Like

✓ Model Status endpoint responds:
```
ready: true
backend: onnx
model: realesrgan-x4plus-onnx
```

✓ Enhancement API returns:
```
HTTP 200
X-SR-Backend: onnx
X-SR-Neural: true
X-SR-Model-Id: realesrgan-x4plus-onnx
X-Scale-Factor: 4
X-Processing-Time: 5000-20000 (ms)
```

✓ Output image:
- Dimensions are 2x or 4x input
- Appears sharper/clearer
- File format is PNG

---

## Test Different Scenarios

### Small Image (Quick Test)
```bash
convert -size 100x100 xc:red test_small.png
node scripts/test-production-model.js test_small.png 4
# Expected: 2-5 seconds
```

### Medium Image (Standard)
```bash
convert -size 500x500 xc:blue test_medium.png
node scripts/test-production-model.js test_medium.png 4
# Expected: 10-20 seconds
```

### Large Image (Performance Test)
```bash
convert -size 1000x1000 xc:green test_large.png
node scripts/test-production-model.js test_large.png 4
# Expected: 30-60 seconds
```

### 2x Scale (Faster)
```bash
node scripts/test-production-model.js test.png 2
# Expected: 30-50% faster than 4x
```

---

## Troubleshooting

### Model Not Ready?
```bash
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .

Check:
- ready: should be true
- backend: should be "onnx"
- model.id: should show realesrgan
```

### Enhancement Failed?
```bash
# Test with smaller image
convert -size 50x50 xc:red tiny.png
node scripts/test-production-model.js tiny.png 4

# If it works, issue is image size
# If it fails, check model status first
```

### Slow Processing?
- First request after deploy: slower (cold start)
- Larger images: slower
- 4x scale: slower than 2x
- Check header: X-Processing-Time

### 503 Error?
- Hugging Face CDN temporarily down
- Wait 5 minutes and retry
- Check: https://status.huggingface.co

---

## One-Liners for Testing

```bash
# Test model is ready
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .ready

# Test with random image
convert -size 200x200 xc:$((RANDOM % 16777215)) test.png && \
  node scripts/test-production-model.js test.png 4

# Batch test multiple scales
for scale in 2 4; do
  echo "Testing scale: ${scale}x"
  node scripts/test-production-model.js test.png $scale
done

# Monitor model status
watch -n 10 'curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .'
```

---

## Expected Results By Image Size

| Input | Scale | Model | Time | Output |
|-------|-------|-------|------|--------|
| 100x100 | 4x | ONNX | 2-5s | 400x400 |
| 500x500 | 4x | ONNX | 10-20s | 2000x2000 |
| 1000x1000 | 4x | ONNX | 30-60s | 4000x4000 |
| 500x500 | 2x | ONNX | 5-10s | 1000x1000 |
| 1000x1000 | 2x | ONNX | 15-30s | 2000x2000 |

---

## Available Test Commands

```bash
# Check model config
pnpm test:huggingface:prod

# Test production model with image
pnpm test:production:model image.png
pnpm test:production:model image.jpg 2

# Or use node directly
node scripts/test-production-model.js test.png 4
```

---

## Verify Success

After running test, check:

1. **File was created**
   ```bash
   ls -lh enhanced_*.png
   ```

2. **File has correct dimensions**
   ```bash
   identify enhanced_*.png
   # Should show: 400x400 (for 100x100 input with 4x scale)
   ```

3. **File size is reasonable**
   ```bash
   du -h enhanced_*.png
   # PNG should be larger than input due to upscaling
   ```

4. **Image is readable**
   ```bash
   open enhanced_*.png  # macOS
   # or
   eog enhanced_*.png   # Linux
   # or
   feh enhanced_*.png   # Any system with feh
   ```

---

## Full Workflow

```bash
# 1. Create test image
convert -size 200x200 -fill red -draw "rectangle 0,0 200,200" test.png

# 2. Check model status
curl -s https://clarity-upscaler.vercel.app/api/neural-status | jq .

# 3. Run production test
node scripts/test-production-model.js test.png 4

# 4. Verify output
identify enhanced_*.png
open enhanced_*.png

# 5. Compare quality
# Left/right comparison in web UI:
# https://clarity-upscaler.vercel.app/studio
```

---

## Next: Monitor & Observe

Once testing successful:
1. Save test results for baseline
2. Monitor response times over time
3. Test with real user images
4. Collect performance metrics
5. Document any issues

