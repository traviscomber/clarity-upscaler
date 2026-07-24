## CLAR1TY STUDIO — COMPLETE PROJECT CODEX

**Project**: Professional Image Upscaling Platform  
**Brand**: Clar1ty (www.clar1ty.art)  
**Status**: Production-Ready (100% CPU-based, Vercel-hosted)  
**Updated**: July 24, 2026

---

## 📋 PROJECT OVERVIEW

Clar1ty Studio is a **Next.js 16 web application** for intelligent image upscaling with smart preset recommendations. The engine runs entirely on Vercel (CPU-based using sharp/Lanczos) with no external GPU dependency, no per-second billing, and zero-latency availability.

**Core Mission**: Analyze user images, intelligently recommend upscaling parameters based on image characteristics (megapixels, quality, content detection), and deliver clean, artifact-free enlargements in real-time.

---

## 🎯 KEY FEATURES

### 1. **Image Analysis (AI Analysis Panel)**
- Automatic dimension extraction (via sharp metadata, handles PNG/JPEG/WebP)
- Quality assessment (Low/Medium/High/Ultra based on megapixel tier)
- Content detection (Face, Architecture, Interior, Text, Nature, Landscape)
- Confidence scoring (0–100%)
- Intelligent preset recommendation with reasoning

### 2. **Smart Preset Recommendation Engine**
- **6 presets** inspired by Philz Stable Diffusion parameters:
  - **Portrait Mode**: Creativity 0.10, Resemblance 1.2 (preserves facial identity)
  - **Architecture**: Creativity 0.20, Resemblance 0.95 (clean geometry)
  - **Nature Enhanced**: Creativity 0.25, Resemblance 0.90 (organic detail)
  - **Full Spectrum**: Creativity 0.35, Resemblance 0.60 (balanced default)
  - **Vivid Enhancement**: Creativity 0.55, Resemblance 0.50 (artistic/cosmic, aggressive)
  - **Fast Mode**: Creativity 0.15, Resemblance 0.80 (speed priority)

- **Intelligent recommendation logic** (`recommendPreset()`):
  - Face detected → Portrait (confidence 95%)
  - Architecture detected → Architecture (90%)
  - Nature/Landscape detected → Nature Enhanced (88%)
  - Low quality + low MP → Vivid for detail recovery (85%)
  - High scale factor (8x) → Vivid (80%)
  - Ultra quality + high MP → Full Spectrum (85%)
  - Fallback: Full Spectrum (70%)

### 3. **Image Upscaling Engine (CPU-Based)**
- **Progressive Multi-Step Lanczos3 Resampling**: Enlarge in repeated ~2x passes instead of single jump
  - 4x scale: 2x → 4x → final (cleaner edges)
  - 8x scale: 2x → 4x → 8x → final (fewer artifacts)
- **Philz Parameter Interpretation**:
  - `creativity` (0.1–0.9) → Sharpening intensity (sigma 0.4–1.6)
  - `resemblance` (0.3–1.6) → Denoise aggressiveness (median radius 1–5)
  - `denoise_steps` (8–28) → Determines denoise strategy
  - `sharpen` (0–10) → Final unsharp masking effect scale
  - `dynamic` (1–50) → Local contrast/tone mapping
- **Pre-enlargement denoise** (prevent grain amplification)
- **Model-aware post-processing** (saturation, color tuning)
- **Format-preserving output** (PNG keeps alpha, WebP stays WebP, else mozjpeg H.264)
- **Safety ceiling**: 40MP maximum to protect memory

### 4. **Interactive Before/After Comparison**
- Dual-panel preview with adjustable slider
- Live parameter display (Fidelity, Detail, Preservation scores)
- Export options (PNG, JPEG, TIFF, WebP)

### 5. **Responsive Design**
- Mobile-first architecture
- Desktop optimized for 1920×1080 and up
- Dark mode (Clar1ty brand: gold #d4a574 on deep brown #1a1410)
- Smooth animations (Framer Motion v12)

---

## 🏗️ ARCHITECTURE

### Tech Stack
- **Frontend**: Next.js 16, React 19.2, TypeScript 5, Tailwind CSS v4
- **Image Processing**: sharp 0.35.3 (libvips-based, production-grade)
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Deployment**: Vercel (serverless)

### Directory Structure
```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx                    # Landing page (hero + features)
│   ├── studio/page.tsx             # Studio workspace (main app)
│   ├── results/page.tsx            # Results viewer (before/after)
│   ├── models/page.tsx             # Model showcase
│   ├── layout.tsx                  # Root layout (metadata, fonts)
│   └── api/
│       ├── analyze/route.ts        # Image analysis endpoint
│       ├── enhance/route.ts        # Image upscaling endpoint
│       └── jobs/route.ts           # Job tracking (optional)
├── lib/
│   └── n3uralia/                   # N3uralia engine
│       ├── engine.ts               # Core types + orchestration
│       ├── analyzer.ts             # Image metadata + analysis
│       ├── processing.ts           # Upscaling + Philz parameter mapping
│       ├── strategy.ts             # Enhancement strategy selection
│       ├── presets.ts              # 6 Philz presets + recommendation logic
│       └── client.ts               # Client SDK helpers
├── components/
│   ├── upload-zone.tsx             # Drag-and-drop upload
│   ├── image-analysis.tsx          # AI Analysis panel display
│   ├── enhancement-panel.tsx       # Preset selector + parameters
│   ├── before-after.tsx            # Interactive comparison slider
│   ├── quality-metrics.tsx         # Fidelity/Detail/Preservation scores
│   └── model-card.tsx              # AI model showcase cards
├── public/
│   ├── showcase/                   # Before/after demo images
│   └── results/                    # User upscaled images (test results)
├── globals.css                     # Tailwind + design tokens
├── package.json                    # Dependencies (sharp, framer-motion, etc.)
└── cog.yaml                        # Cog model config (for future GPU deployment)

/n3uralia/                          # GPU engine (Philz-based, for future deployment)
├── predict.py                      # Replicate/cog predictor
├── engine/                         # Engine modules
├── integration/                    # Integration bridge
├── backends/                       # Adapter layer
├── router/                         # Preservation routing
├── presets/                        # Preset JSON files
└── README.md                       # N3uralia documentation
```

### Data Flow Pipeline

#### **1. Upload Stage**
```
User selects image
  ↓
upload-zone.tsx dispatches FileReader
  ↓
Canvas preview generated
  ↓
Image sent to /api/analyze
```

#### **2. Analysis Stage**
```
POST /api/analyze {image buffer}
  ↓
analyzer.ts:
  - Sharp reads metadata (true dimensions, rotation)
  - Extract megapixels, quality tier, confidence
  ↓
Content detection (Face, Architecture, etc.)
  ↓
recommendPreset(megapixels, quality, content)
  ↓
Return ImageAnalysis {
  resolution, megapixels, quality, confidence,
  detectedContent, recommendations,
  recommendedPresetId, recommendedPresetReason
}
  ↓
enhancement-panel.tsx displays preset with "Recommended" badge
```

#### **3. Enhancement Stage**
```
User clicks "ENHANCE IMAGE"
  ↓
studio/page.tsx sends to /api/enhance {
  image buffer,
  strategy {
    name, model, scaleFactor,
    preservationLevel, qualityTarget,
    presetId, creativity, resemblance,
    denoise_steps, sharpen, dynamic
  }
}
  ↓
processing.ts:
  1. getPhilzProfile(strategy)
     - Map creativity → sharpening sigma (0.4–1.6)
     - Map resemblance → denoise radius (1–5)
     - Calculate saturation from resemblance
  
  2. Pre-denoise if denoise_steps > 12
     - median(denoiseRadius)
  
  3. Progressive upscaling via buildUpscaleSteps()
     - Determine intermediate sizes (~2x each step)
     - Lanczos3 resample at each step (speed path: single fast pass)
  
  4. Unsharp masking
     - sharpenSigma from Philz creativity parameter
     - Scaled by sharpen parameter (0–10)
     - Threshold tuning (m1=0.5, m2=2.5)
  
  5. Color tuning
     - Saturation based on resemblance
  
  6. Format preservation
     - PNG → PNG (alpha channel intact)
     - WebP → WebP
     - Else → mozjpeg (quality 94)
  ↓
Return {
  buffer (enhanced image bytes),
  width, height,
  contentType,
  metadata headers (X-Output-Width, X-Enhanced-Size, processing time)
}
  ↓
before-after.tsx displays comparison slider
  ↓
User can export or try different preset/parameters
```

### Type System
```typescript
// Core analysis result
interface ImageAnalysis {
  resolution: string;
  megapixels: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  confidence: number;
  detectedContent: string[];
  recommendations: string[];
  recommendedPresetId?: string;
  recommendedPresetReason?: string;
}

// Enhancement request
interface EnhancementStrategy {
  name: string;
  model: string;
  scaleFactor: number;
  preservationLevel: number;
  qualityTarget: 'speed' | 'balanced' | 'quality';
  presetId?: string;
  // Philz parameters (optional, interpreted locally)
  creativity?: number;
  resemblance?: number;
  denoise_steps?: number;
  sharpen?: number;
  dynamic?: number;
  tile_overlap?: number;
}

// Processing result
interface EnhancementResult {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: string;
}

// Preset definition
interface PhilzPreset {
  id: string;
  name: string;
  description: string;
  creativity: number;
  resemblance: number;
  denoise_steps: number;
  sharpen: number;
  dynamic: number;
  tile_overlap: number;
  recommended_for: string[];
}

// Recommendation with reasoning
interface PresetRecommendation {
  preset: PhilzPreset;
  reason: string;
  confidence: number; // 0–1
}
```

---

## 📍 PROJECT LINKS & DEPLOYMENT

### **Vercel Project**
- **Project ID**: prj_zGd1zEKFMqxV6Nj12qy5Dm9sXA4R
- **Team ID**: team_OZTpx87yFUvdvneuoNbJeYS1
- **Project Name**: clarity-upscaler
- **Live URL**: https://clarity-upscaler.vercel.app (once deployed)
- **Environment**: Production (CPU-only, no GPU functions)

### **GitHub Repository**
- **Org**: traviscomber
- **Repo**: clarity-upscaler
- **Base Branch**: main
- **Current Branch**: clar1ty-studio (active development)
- **GitHub URL**: https://github.com/traviscomber/clarity-upscaler

### **v0 Project Context**
- **v0 Chat Workspace**: `/vercel/share/v0-project` (local development)
- **v0 Memories**: `v0_memories/user/` (persisted across sessions)
- **Key Memory Files**:
  - `CLAR1TY_STUDIO_BUILD.md` — Latest build status
  - `MAINTENANCE_EQUIPMENT_SYNC_COMPLETE.md` — Integration details
  - `COST_TRACKING.md` — Session expenses

### **Commit History (Latest)**
- `a48e04a` — Production-complete with all pages + components
- Recent: Smart preset system with Philz parameter integration
- Recent: Progressive Lanczos upscaling engine
- Recent: CPU-only decision (no GPU host)

---

## 🚀 API ENDPOINTS

### **POST /api/analyze**
Analyzes uploaded image and returns metadata + smart recommendation.

**Request**:
```
FormData:
  - image: File (PNG/JPEG/WebP)
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "resolution": "1792 × 1024px",
    "megapixels": 1.8,
    "quality": "low",
    "confidence": 0.93,
    "detectedContent": ["Architecture", "Text"],
    "recommendations": ["4x upscaling recommended"],
    "recommendedPresetId": "architecture",
    "recommendedPresetReason": "Architecture detected. Clean geometry and sharp edges mode."
  }
}
```

### **POST /api/enhance**
Upscales image using selected preset and parameters.

**Request**:
```
FormData:
  - image: File (PNG/JPEG/WebP)
  - strategy: JSON {
      name, model, scaleFactor (2|4|8),
      preservationLevel, qualityTarget,
      presetId, creativity, resemblance,
      denoise_steps, sharpen, dynamic
    }
```

**Response**:
```
Binary PNG/JPEG/WebP with headers:
  - Content-Type: image/png|jpeg|webp
  - X-Output-Width: 7168
  - X-Output-Height: 4096
  - X-Enhanced-Size: 56300000
  - X-Processing-Time: 4700
  - X-Fidelity: 92
  - X-Detail: 89
  - X-Preservation: 85
```

---

## 🎨 DESIGN SYSTEM

### **Color Palette**
- **Primary**: Gold #d4a574 (accents, CTAs, highlights)
- **Background**: Deep brown #1a1410 (main bg)
- **Surface**: #2d2620 (panels, cards)
- **Border**: #3a3530 (dividers, outlines)
- **Text**: #e8e4dd (primary), #8b8278 (secondary)
- **Accent**: Teal/cyan for highlights

### **Typography**
- **Heading Font**: Geist (Next.js default)
- **Body Font**: Geist (monospace for parameters)
- **Sizes**: Semantic scale (sm, base, lg, xl, 2xl)

### **Components**
- Upload zone (drag-and-drop with border feedback)
- Preset selector dropdown (6 presets with inline parameters)
- Before/after slider (dual panel, interactive handle)
- Parameter display grid (Creativity, Resemblance, Denoise, Sharpen)
- Quality metrics badges (Fidelity %, Detail %, Preservation %)

---

## 📊 DEVELOPMENT WORKFLOW

### **Local Development**
```bash
cd /vercel/share/v0-project
pnpm dev                # Starts on http://localhost:3000
pnpm build              # Production build
pnpm test               # Run tests (if configured)
```

### **Git Workflow**
```bash
# Current branch: clar1ty-studio
git checkout clar1ty-studio
git pull origin main

# Make changes, commit
git add .
git commit -m "feat: [description]"

# Push to branch
git push origin clar1ty-studio

# Create/update PR to main via GitHub
```

### **Deployment to Vercel**
```bash
# Via GitHub: Auto-deploy on push to main or PR preview
# Or manual CLI:
vercel --prod --scope team_OZTpx87yFUvdvneuoNbJeYS1
```

---

## ⚙️ CONFIGURATION & ENVIRONMENT

### **Tailwind CSS (v4)**
- Theme tokens in `globals.css` under `@theme { ... }`
- Design tokens: --background, --foreground, --primary, --radius, etc.
- No `tailwind.config.js` (v4 inline config)

### **Next.js 16**
- **Framework**: App Router (not Pages Router)
- **React Compiler**: Stable (enabled in next.config.js)
- **Font Loading**: Geist via `next/font/google`
- **Image Optimization**: Next.js Image component (future enhancement)

### **Sharp Configuration**
- **Version**: 0.35.3 (latest production)
- **Kernel**: Lanczos3 for high-quality resampling
- **Middleware**: No CORS issues (local processing)
- **Output**: mozjpeg H.264 for JPEG (quality 94)

### **Dependencies** (key)
- `sharp@0.35.3` — Image processing
- `framer-motion@12` — Animations
- `lucide-react` — Icons
- `tailwindcss@4` — Styling
- `typescript@5` — Type safety

---

## 🔄 FUTURE INTEGRATION POINTS

### **GPU Engine Integration** (Optional)
If you deploy the Philz GPU engine on Replicate/fal/Modal:
- API endpoint URL env var in Vercel
- `/api/enhance` routes to GPU if available, falls back to sharp
- Same preset/parameter interface (no UI change needed)

### **User Accounts & History**
- Supabase or Neon database integration
- Store user upscaling history + custom presets
- Authenticated /dashboard/history page

### **Batch Processing**
- Queue multiple images for upscaling
- Background job worker (Vercel Cron)
- Progress tracking + email notifications

### **Advanced Preset Builder**
- UI for creating custom presets
- Save presets to user account
- Share preset links

---

## 📝 NOTABLE DECISIONS

1. **CPU-only engine**: No GPU host dependency, instant availability, zero per-second billing
2. **Progressive upscaling**: Better visual quality at 4x/8x vs. single-pass jumps
3. **Philz parameter mapping**: Maintain compatibility with industry-standard upscaler params
4. **Sharp as backbone**: Production-grade, fast, widely battle-tested
5. **Vercel deployment**: Seamless Next.js integration, global CDN, instant scaling
6. **Smart recommendations**: Reduce user decision paralysis with intelligent defaults

---

## 🐛 DEBUGGING & LOGS

### **Console Logs**
- Use `console.log("[v0] ...")` pattern during development
- Remove before commit to main

### **API Troubleshooting**
- Check `/api/analyze` and `/api/enhance` response headers for error details
- Verify image format support (PNG/JPEG/WebP)
- Monitor processing time via `X-Processing-Time` header

### **Performance Monitoring**
- Sharp operations logged in API responses
- Frontend timing via Web Vitals (LCP, INP, CLS)
- Vercel Analytics dashboard for production metrics

---

## 📞 CONTACT & SUPPORT

- **Project Owner**: traviscomber
- **Repository**: https://github.com/traviscomber/clarity-upscaler
- **Live Status**: Check Vercel dashboard for deployment status
- **Issues**: File bugs via GitHub Issues or v0 chat

---

**Last Updated**: July 24, 2026  
**Version**: 1.0.0-production  
**Status**: Ready for deployment & user testing
