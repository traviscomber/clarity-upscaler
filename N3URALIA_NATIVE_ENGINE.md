# N3uralia Native Engine

## Objective

Build a proprietary image restoration and super-resolution platform without third-party inference APIs.

Vercel remains the public application, authentication, API gateway and job-control layer. Neural inference runs in a self-hosted Python service that can initially run on a developer workstation and later move unchanged to a dedicated GPU server.

## Non-negotiable constraints

- No Replicate, fal, Together, OpenAI Images or other per-image inference dependency.
- Model weights are stored and executed on infrastructure controlled by N3uralia.
- Every neural dependency must pass a commercial-license review before production use.
- The browser never receives engine credentials or direct worker access.
- Vercel must always retain a deterministic Sharp fallback.
- Neural results must record the model, checkpoint, engine version and execution parameters.
- Fidelity and generative reconstruction are separate product modes.

## Target architecture

```text
Browser
  |
  v
Clar1ty Studio on Vercel
  - authentication
  - uploads
  - job creation
  - status polling
  - result delivery
  |
  v
Private N3uralia Worker API
  - signed requests
  - local model registry
  - degradation analysis
  - routing
  - tiled inference
  - quality checks
  |
  +--> Sharp deterministic pipeline
  +--> fidelity model
  +--> blind-restoration model
  +--> perceptual reconstruction model
  +--> future N3uralia checkpoints
```

## Deployment stages

### Stage 1: local development

- Vercel application or local Next.js application calls a machine on the private development network.
- Python worker runs with Docker Compose.
- Model files live under `n3uralia/weights/` and are never committed.
- CPU execution is supported for integration tests; GPU execution is the production target.

### Stage 2: owned workstation

- Persistent NVIDIA workstation.
- Reverse proxy with TLS.
- IP allowlist or private tunnel.
- Worker keeps models loaded between jobs.
- Object storage remains Supabase Storage or another controlled bucket.

### Stage 3: dedicated server

- Same container image and API contract.
- One or more GPU workers.
- Queue-based scheduling.
- Worker health, VRAM, latency and failure telemetry.

## Engine modes

### Fast

- Provider: Sharp or compact neural model.
- Purpose: previews, high-resolution clean inputs, no hallucination.

### Fidelity

- Provider candidate: SwinIR or HAT-derived checkpoint.
- Purpose: geometry, text, faces, technical imagery and archival preservation.

### Restore

- Provider candidate: Real-ESRGAN-derived checkpoint, later replaced by N3uralia restoration training.
- Purpose: JPEG artifacts, mixed blur, noise and old web images.

### Detail

- Provider candidate: commercially compatible one-step restoration model after benchmark and license review.
- Purpose: premium perceptual reconstruction with an explicit hallucination warning.

## Required subsystems

### 1. Decoder and color pipeline

- EXIF orientation.
- ICC profile extraction and preservation.
- sRGB and wide-gamut handling.
- Alpha-safe processing.
- 8-bit and future 16-bit paths.
- No intermediate lossy encoding.

### 2. Degradation analyzer

Must measure real image signals rather than randomly assigning labels:

- blur estimate;
- noise estimate;
- JPEG blocking;
- ringing and oversharpening;
- texture density;
- edge density;
- clipping and dynamic range;
- face and text regions;
- source and content class;
- analysis confidence.

### 3. Restoration planner

Inputs:

- user intent;
- degradation measurements;
- content regions;
- requested scale;
- latency and VRAM limits;
- hallucination tolerance.

Outputs:

- provider and checkpoint;
- tile size and overlap;
- pre-processing stages;
- specialist passes;
- post-processing stages;
- rejection and fallback rules.

### 4. Model registry

Each model record must contain:

- stable identifier;
- checkpoint path and checksum;
- license and source;
- supported scales;
- precision support;
- minimum VRAM;
- preferred tile sizes;
- semantic version;
- benchmark version;
- enabled state.

### 5. Tiled inference

- reflection padding;
- context halo;
- overlap feathering;
- deterministic tile ordering;
- global color consistency;
- seam detection;
- retry with smaller tiles after out-of-memory errors.

### 6. Quality validation

Production metrics must be computed, not inferred from presets:

- source/output consistency;
- edge displacement;
- color delta;
- face identity similarity where applicable;
- OCR consistency for text regions;
- no-reference perceptual metrics;
- tile seam score;
- clipping and halo detection.

### 7. Provenance

Every job records:

- engine version;
- provider;
- model and checkpoint checksum;
- input checksum;
- output checksum;
- parameters;
- processing time;
- peak memory where available;
- quality report;
- fallback reason.

## Training strategy

Do not train a large model from zero initially.

1. Build a realistic degradation generator.
2. Establish benchmark datasets and human A/B evaluation.
3. Integrate an open-weight restoration baseline locally.
4. Train a fidelity checkpoint from a proven backbone.
5. Train a separate perceptual checkpoint.
6. Distill the premium checkpoint for lower latency.
7. Add domain adapters for architecture, nature, historical photography, faces, products and CGI.

## Benchmark gate

A model cannot enter production without:

- commercial-license approval;
- reproducible benchmark report;
- latency and VRAM profile;
- tile seam test;
- architecture, face and text safety tests;
- comparison against Sharp baseline;
- comparison against the currently deployed neural model;
- human preference evaluation.

## Immediate implementation sequence

1. Add the local worker API and health contract.
2. Add signed Vercel-to-worker requests.
3. Add local model registry configuration.
4. Add job/result schemas and provenance.
5. Add benchmark harness and degradation generator.
6. Integrate the first local neural baseline.
7. Route only explicit neural modes to the worker.
8. Keep Sharp fallback operational throughout.
