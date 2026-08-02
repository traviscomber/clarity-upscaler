# Hugging Face ONNX Model Integration

This guide explains how to integrate ONNX models from Hugging Face Hub with Clarity Upscaler's N3URALIA neural engine.

## Overview

The N3URALIA engine supports loading ONNX (Open Neural Network Exchange) models directly from Hugging Face Hub. This enables:

- Fast, optimized inference via ONNX Runtime (WebAssembly)
- Multi-tile processing for large images
- Flexible model selection and switching
- Production-ready super-resolution models

## Supported Models

### Real-ESRGAN 4x+ (Recommended)

**Model ID:** `realesrgan-x4plus-onnx`
**Upscale Factor:** 4x
**Architecture:** RRDBNet / Real-ESRGAN
**Hugging Face Repo:** [`xinntao/Real-ESRGAN-4x-plus-onnx`](https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx)

Best for general-purpose photo enhancement and detail recovery.

### Real-ESRGAN 2x+ (Faster)

**Model ID:** `realesrgan-x2plus-onnx`
**Upscale Factor:** 2x
**Architecture:** RRDBNet / Real-ESRGAN
**Hugging Face Repo:** [`xinntao/Real-ESRGAN-2x-onnx`](https://huggingface.co/xinntao/Real-ESRGAN-2x-onnx)

Faster inference for 2x upscaling tasks.

## Configuration

### Environment Variables

Set these variables to enable ONNX super-resolution:

```bash
# Enable ONNX backend
N3URALIA_SR_BACKEND=onnx

# Primary model (4x)
N3URALIA_ONNX_MODEL_ID=realesrgan-x4plus-onnx
N3URALIA_ONNX_MODEL_URL=https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx/resolve/main/RealESRGAN_x4plus.onnx

# Secondary model (2x, optional)
N3URALIA_ONNX_MODEL_URL_2=https://huggingface.co/xinntao/Real-ESRGAN-2x-onnx/resolve/main/RealESRGAN_x2plus.onnx

# Optional: Override default tile settings
N3URALIA_ONNX_TILE_SIZE=128          # Default: 128
N3URALIA_ONNX_TILE_OVERLAP=16        # Default: 16

# Optional: Specify ONNX input/output names (auto-detected if not set)
N3URALIA_ONNX_INPUT_NAME=images
N3URALIA_ONNX_OUTPUT_NAME=output
```

### Direct Hugging Face URLs

When setting model URLs, use the CDN or direct resolve URLs:

```bash
# CDN (faster, recommended)
https://cdn-lfs.huggingface.co/repos/xinntao/Real-ESRGAN-4x-plus-onnx/main/RealESRGAN_x4plus.onnx

# Direct resolve (fallback)
https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx/resolve/main/RealESRGAN_x4plus.onnx
```

## Monitoring

### Neural Status Endpoint

Check the status of your ONNX configuration:

```bash
# Basic status check
curl http://localhost:3000/api/neural-status

# With connectivity probe
curl http://localhost:3000/api/neural-status?probe=1
```

Response:

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
    "host": "huggingface.co"
  },
  "probe": {
    "attempted": true,
    "reachable": true,
    "status": 206,
    "contentLength": "64.5MB",
    "contentType": "application/octet-stream"
  },
  "fallback": {
    "enabled": true
  }
}
```

## Finding Models on Hugging Face

To find ONNX super-resolution models:

1. Visit [huggingface.co](https://huggingface.co)
2. Search for "ONNX super-resolution" or "ESRGAN"
3. Filter by ONNX format
4. Check model details for:
   - Input/output format (should be RGB float32 NCHW)
   - Scale factor (2x, 4x, etc.)
   - File size and performance characteristics

Popular sources:
- [Real-ESRGAN models](https://huggingface.co/xinntao) - General purpose super-resolution
- [Community ONNX conversions](https://huggingface.co/search?q=onnx+super-resolution)

## Converting Your Own ONNX Models

If you want to use a custom model:

1. Export/convert your model to ONNX format
   - PyTorch: Use `torch.onnx.export()`
   - TensorFlow: Use `tf2onnx`

2. Verify format:
   - Input: RGB, float32, NCHW layout
   - Output: RGB, float32, NCHW/NHWC layout
   - Opset version: 11+ recommended

3. Upload to Hugging Face Hub:
   ```bash
   huggingface-cli upload <repo-id> RealESRGAN_x4.onnx
   ```

4. Set environment variables to your new model URL

## Performance Optimization

### Tile Size

Larger tiles = faster but uses more memory:
- **64**: Conservative (slow, low memory)
- **128**: Balanced (recommended)
- **256**: Aggressive (fast, high memory)

### Overlap

Overlap reduces tiling artifacts:
- **8**: Minimal overlap (fast)
- **16**: Balanced (recommended)
- **32**: Maximum overlap (slow)

### Fallback Behavior

If ONNX inference fails, the system falls back to classical filters:

```bash
# Disable fallback (fail fast)
N3URALIA_SR_BACKEND_FALLBACK=false

# Enable fallback (default)
N3URALIA_SR_BACKEND_FALLBACK=true
```

## Troubleshooting

### Model not reachable

**Error:** `probe.reachable: false`

Check:
1. Model URL is correct
2. Network connectivity to Hugging Face
3. Model file still exists (not deleted)

### Wrong input/output format

**Error:** `ONNX model did not return output`

Check:
1. Input layout is NCHW (not NHWC)
2. Output names match model (auto-detect by default)
3. Data types are float32 (not int8/int32)

### Out of memory

**Error:** `Tile size too large`

Reduce tile size or use 2x model instead of 4x.

## API Integration

Load the Hugging Face loader in your code:

```typescript
import {
  parseHuggingFaceModel,
  constructHuggingFaceUrl,
  verifyHuggingFaceModel,
} from '@/lib/n3uralia/huggingface-loader';

// Parse a Hugging Face URL
const config = parseHuggingFaceModel(
  'xinntao/Real-ESRGAN-4x-plus-onnx'
);

// Construct download URL
const url = constructHuggingFaceUrl(config);

// Verify model is accessible
const verification = await verifyHuggingFaceModel(url);
console.log('Model reachable:', verification.accessible);
```

## References

- [ONNX Runtime JavaScript](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN)
- [Hugging Face Hub Documentation](https://huggingface.co/docs/hub/index)
