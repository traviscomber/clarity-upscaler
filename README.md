# Clar1ty Studio - Professional Image Upscaling

Modern web application for professional image upscaling powered by the N3uralia engine. Built with Next.js 16, React 19, and Tailwind CSS v4.

[![App](https://img.shields.io/badge/App-Clar1ty-blueviolet)](http://localhost:3000)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)

## 🎯 Overview

Clar1ty Studio is a professional-grade image upscaling platform that combines intelligent AI analysis with accessible web design. The application automatically detects image content, recommends optimal enhancement strategies, and provides real-time quality metrics throughout the enhancement process.

### Core Philosophy
- **No Visual Noise** - Clean interface focused on your images
- **Image is Hero** - UI supports, never competes
- **Explainable AI** - Transparent decision-making with detailed metrics
- **Preserve Original** - Enhancement without destruction
- **Professional Workflow** - Built for creative professionals

## 📦 What's Included

- **Next.js 16 App Router** - Modern React server-side rendering
- **Design System** - Custom Clar1ty brand tokens and colors
- **N3uralia Engine** - AI-powered image analysis and enhancement
- **Responsive UI** - Mobile-first design with Tailwind CSS v4
- **Animations** - Smooth interactions with Framer Motion
- **API Routes** - Server-side image processing endpoints
- **TypeScript** - Full type safety across the stack

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build optimized version
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── globals.css             # Global styles & design tokens
├── studio/
│   └── page.tsx            # Main upscaling interface
├── models/
│   └── page.tsx            # Models showcase
└── api/
    ├── analyze/route.ts    # Image analysis
    └── enhance/route.ts    # Image enhancement

components/
├── upload-zone.tsx         # File upload
├── image-analysis.tsx      # Analysis display
├── enhancement-panel.tsx   # Controls
└── before-after.tsx        # Comparison slider

lib/
├── brand/
│   ├── tokens.ts          # Design system
│   └── principles.ts      # UI principles
└── n3uralia/
    ├── engine.ts          # Main engine
    ├── analyzer.ts        # Image analysis
    ├── strategy.ts        # Strategy selection
    └── processing.ts      # Enhancement pipeline
```

## 🎨 Design System

### Color Palette
- **Background**: `#050505` - Deep black
- **Foreground**: `#F5F5F2` - Warm white
- **Surface**: `#101010` - Dark surfaces
- **Accent Neural**: `#7FE7D8` - Cyan accent
- **Accent Intelligence**: `#5B8CFF` - Blue accent

### Typography
- **Display**: Inter Tight (600 weight)
- **Body**: Inter (400 weight)  
- **Technical**: JetBrains Mono (400 weight)

## 🧠 N3uralia Engine

The engine includes:

1. **Image Analyzer** - Detects content, quality, and recommendations
2. **Strategy Selector** - Chooses optimal upscaling approach
3. **Processing Pipeline** - Executes enhancement operations
4. **Quality Evaluator** - Calculates preservation metrics

### Available Models
- **Architecture v1** - Buildings and structures
- **Nature Enhanced** - Landscapes and wildlife
- **Face Restoration** - Portraits and facial details
- **Clean Detail** - Fast general-purpose
- **Full Spectrum** - Universal content handler

## 🔌 API Endpoints

### POST /api/analyze
Analyzes image and returns metadata.

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@photo.jpg"
```

### POST /api/enhance
Enhances image with selected strategy.

```bash
curl -X POST http://localhost:3000/api/enhance \
  -F "image=@photo.jpg" \
  -F 'strategy={"scaleFactor":2,"model":"Architecture v1"}'
```

## 🌐 Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with hero & features |
| `/studio` | Main upscaling interface |
| `/models` | Model showcase & documentation |

## 📊 Features

- ✅ Drag-and-drop image upload
- ✅ Automatic content analysis
- ✅ Multiple upscaling models
- ✅ Interactive before/after slider
- ✅ Real-time quality metrics
- ✅ Scale factor selection (2x, 4x, 8x)
- ✅ Quality targets (speed, balanced, quality)
- ✅ Responsive design
- ✅ Smooth animations

## 🚀 Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

Environment variables:
- `NEXT_PUBLIC_APP_NAME` - App name in UI (optional)

## 🔧 Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 |
| React | 19.2.8 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Language | TypeScript 5 |
| Build | Turbopack |

## 📄 License

Copyright 2024 Clar1ty Studio. All rights reserved.
