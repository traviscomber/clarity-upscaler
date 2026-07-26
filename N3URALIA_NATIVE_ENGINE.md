# N3uralia Native Engine

## Objective

Build a proprietary image restoration and super-resolution platform without depending on third-party image-enhancement APIs.

Vercel remains the public application, authentication, API gateway and job-control layer. Neural inference runs in a self-hosted Python service that can initially run on a developer workstation and later move unchanged to a dedicated GPU server.

OpenAI models may be used as an optional intelligence, evaluation and orchestration layer through `OPENAI_API_KEY`. They must not become the sole pixel-processing engine or a hard dependency for producing an enhanced image.

## Non-negotiable constraints

- No Replicate, fal, Together or other per-image enhancement dependency.
- OpenAI usage is permitted where it improves analysis, planning, evaluation, support or research automation.
- Core super-resolution and restoration weights are stored and executed on infrastructure controlled by N3uralia.
- Every neural dependency must pass a commercial-license review before production use.
- The browser never receives engine credentials or direct worker access.
- `OPENAI_API_KEY` remains server-side in Vercel or the private worker environment.
- Vercel must always retain a deterministic Sharp fallback.
- The native worker must remain capable of completing jobs when OpenAI is unavailable.
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
  - optional OpenAI orchestration
  |
  v
Private N3uralia Worker API
  - signed requests
  - local model registry
  - deterministic degradation analysis
  - routing
  - tiled inference
  - quality checks
  - optional OpenAI advisory calls
  |
  +--> Sharp deterministic pipeline
  +--> fidelity model
  +--> blind-restoration model
  +--> perceptual reconstruction model
  +--> future N3uralia checkpoints
```

## OpenAI role

OpenAI is an accelerator for the platform, not the restoration core.

### Appropriate uses

- Semantic scene and content classification from a reduced-resolution proxy.
- Detecting whether an image contains faces, text, architecture, products, artwork or sensitive content.
- Converting deterministic analyzer measurements into a structured restoration plan.
- Explaining recommended settings to the user.
- Generating strict JSON pipeline plans through Structured Outputs.
- Reviewing benchmark contact sheets and flagging likely artifacts for human verification.
- Producing dataset captions and searchable tags.
- Research assistance, experiment summaries and checkpoint comparison reports.
- Support diagnostics based on job metadata and quality reports.
- Optional image generation or editing only as a separately labeled creative workflow, never presented as faithful super-resolution.

### Inappropriate uses

- Using a vision-language model score as the only quality metric.
- Sending every full-resolution image to OpenAI by default.
- Allowing an OpenAI response to bypass deterministic safety constraints.
- Using image generation to fabricate detail inside Fidelity mode.
- Making image enhancement fail because OpenAI is unavailable.
- Exposing the API key to the browser or client bundle.

### Decision hierarchy

```text
Hard constraints and user intent
  > deterministic image measurements
  > model registry capabilities
  > OpenAI advisory recommendation
  > fallback defaults
```

OpenAI may recommend a plan, but the local planner validates and clamps every field before execution.

### Suggested model routing

Model identifiers must be configurable environment variables rather than hardcoded assumptions.

```text
OPENAI_ANALYSIS_MODEL
  - vision-capable model for proxy-image classification

OPENAI_PLANNER_MODEL
  - reasoning model for structured restoration plans

OPENAI_EVAL_MODEL
  - vision-capable model for benchmark review and artifact triage
```

The application should verify actual account availability through the Models API during diagnostics and use tested defaults in deployment configuration.

### Structured advisory output

The OpenAI planner returns a strict schema such as:

```json
{
  "content": {
    "primaryClass": "architecture",
    "containsFaces": false,
    "containsText": true,
    "semanticRisk": "low"
  },
  "recommendation": {
    "mode": "fidelity",
    "scale": 4,
    "denoise": 0.18,
    "deblur": 0.22,
    "artifactRemoval": 0.42,
    "generativeStrength": 0,
    "notes": ["Preserve signage", "Avoid texture invention"]
  },
  "confidence": 0.88
}
```

This object is advisory. The native planner rejects unsupported modes, excessive values and unsafe combinations.

### Cost and privacy controls

- OpenAI calls are opt-in by feature and controlled by environment flags.
- Use reduced-resolution proxies for semantic analysis whenever possible.
- Cache analysis by image checksum and prompt/model version.
- Never call OpenAI per tile.
- Set request timeouts and strict token limits.
- Record model, prompt version, latency and estimated usage.
- Do not send confidential images unless the product policy explicitly permits it.
- Use `store: false` where appropriate and configure project data controls according to deployment requirements.

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
- OpenAI may classify content or explain the plan but cannot introduce pixels.

### Restore

- Provider candidate: Real-ESRGAN-derived checkpoint, later replaced by N3uralia restoration training.
- Purpose: JPEG artifacts, mixed blur, noise and old web images.

### Detail

- Provider candidate: commercially compatible one-step restoration model after benchmark and license review.
- Purpose: premium perceptual reconstruction with an explicit hallucination warning.

### Creative

- Optional OpenAI image generation or another explicitly enabled creative provider.
- Purpose: reinterpretation, extension or semantic reconstruction where fidelity is not guaranteed.
- Must remain visually and contractually separate from Fidelity and Restore modes.

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

Semantic OpenAI analysis may augment this subsystem, but deterministic measurements remain authoritative.

### 3. Restoration planner

Inputs:

- user intent;
- degradation measurements;
- content regions;
- requested scale;
- latency and VRAM limits;
- hallucination tolerance;
- optional OpenAI advisory plan.

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

OpenAI visual review may flag subjective artifacts but never replaces these measurements or human benchmark review.

### 7. Provenance

Every job records:

- engine version;
- provider;
- model and checkpoint checksum;
- OpenAI model and prompt version when used;
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
8. Use OpenAI to accelerate captioning, experiment analysis and benchmark triage without making training dependent on it.

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

OpenAI-assisted ratings may be stored as an additional signal, not the promotion criterion.

## Immediate implementation sequence

1. Add the local worker API and health contract.
2. Add signed Vercel-to-worker requests.
3. Add local model registry configuration.
4. Add job/result schemas and provenance.
5. Add benchmark harness and degradation generator.
6. Integrate the first local neural baseline.
7. Add optional OpenAI proxy-image analysis with Structured Outputs.
8. Route only explicit neural modes to the worker.
9. Keep Sharp fallback operational throughout.
