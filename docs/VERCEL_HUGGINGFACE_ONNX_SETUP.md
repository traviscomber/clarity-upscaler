# Vercel + Hugging Face ONNX test setup

This guide configures Clar1ty on Vercel to test neural 4x super-resolution with a free Hugging Face-hosted ONNX model or Space while preserving the classical CPU fallback.

## Current supported mode: direct ONNX model URL

The current Clar1ty ONNX backend downloads a compatible ONNX model during the first server invocation and runs it with ONNX Runtime WebAssembly inside the Vercel function.

Set these variables in **Vercel > clarity-upscaler > Settings > Environment Variables**:

```text
N3URALIA_SR_BACKEND=onnx
N3URALIA_ONNX_MODEL_ID=realesrgan-x4plus-onnx
N3URALIA_ONNX_MODEL_URL=https://huggingface.co/<account>/<model-repository>/resolve/main/<model-file>.onnx
N3URALIA_ONNX_TILE_SIZE=128
N3URALIA_ONNX_TILE_OVERLAP=16
```

Apply the variables to **Production**, **Preview**, and **Development** unless a separate test environment is required.

If the Hugging Face model repository is private, do not place the token in the model URL. The current direct-download implementation supports public model files only. Use a public test repository or add authenticated model downloading before using private assets.

## Deployment steps

1. Create or select a Hugging Face model repository containing a Real-ESRGAN-compatible 4x ONNX file.
2. Verify the file can be downloaded directly from its `/resolve/main/` URL without signing in.
3. Add the five environment variables above in Vercel.
4. Redeploy the latest `main` deployment from the Vercel dashboard so the variables are included.
5. Upload a small image first, ideally 256x256 or 512x512.
6. Select 4x enhancement and run the process.
7. Confirm the Studio result badge reports **Neural ONNX**, not **Classical CPU**.
8. Confirm the response reports the expected model ID and no fallback reason.

## Verification headers

The `/api/enhance` response exposes:

```text
X-SR-Backend
X-SR-Neural
X-SR-Model-Id
X-SR-Fallback-Reason
X-Output-Width
X-Output-Height
X-Tiled-Processing
X-Tile-Plan
```

Expected values for a successful neural run:

```text
X-SR-Backend: onnx
X-SR-Neural: true
X-SR-Model-Id: realesrgan-x4plus-onnx
X-SR-Fallback-Reason: <empty>
```

For a 1024x1024 input at 4x, the expected output is 4096x4096. The current 40 MP ceiling does not clamp this result because it is approximately 16.8 MP.

## Safe fallback

If the model cannot be downloaded, loaded, or executed, Clar1ty automatically falls back to the classical Sharp/Lanczos pipeline. Studio must show **Classical CPU** and the fallback reason. This prevents a failed ONNX test from breaking production image processing.

## Hugging Face Space API mode

A Gradio Space can expose an external image-to-image API, but Clar1ty does not yet route enhancement requests to a Space endpoint. The current production integration runs the ONNX model inside Vercel. A separate `huggingface-api` backend should be added before configuring variables such as `HF_SPACE_URL` or `HF_TOKEN`.

Do not add unused Hugging Face secrets to Vercel until that backend exists.

## Initial test limits

Use small inputs during the first test because Vercel CPU and memory limits can make WebAssembly inference slow. Recommended sequence:

```text
256x256 -> 1024x1024
512x512 -> 2048x2048
1024x1024 -> 4096x4096 only after smaller tests pass
```

Record processing time, backend, model ID, tile count, output dimensions, metrics, and fallback reason for every test.