'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cpu, BarChart3, Layers, Shield, Zap, SlidersHorizontal, ArrowRight } from 'lucide-react';

const features = [
  {
    title: 'Smart Analysis',
    description: 'AI automatically detects content type and recommends the optimal enhancement model for your image.',
    icon: Cpu,
  },
  {
    title: 'Quality Metrics',
    description: 'Real-time fidelity, detail recovery, and preservation scores measured on every enhancement.',
    icon: BarChart3,
  },
  {
    title: 'Multiple Models',
    description: 'Specialized models for architecture, nature, portraits, and general-purpose upscaling.',
    icon: Layers,
  },
  {
    title: 'Preservation First',
    description: 'Never destroys original data. The N3uralia engine enhances without introducing loss.',
    icon: Shield,
  },
  {
    title: 'Fast Processing',
    description: 'Optimized inference pipeline with speed, balanced, and quality targets to fit your workflow.',
    icon: Zap,
  },
  {
    title: 'Professional Controls',
    description: 'Before/after comparison slider, scale factor selection, and export in PNG, TIFF, or WebP.',
    icon: SlidersHorizontal,
  },
];

const stats = [
  { value: 'Up to 8×', label: 'Upscale factor' },
  { value: '5', label: 'Specialized models' },
  { value: '13K²', label: 'Max resolution' },
  { value: '0 loss', label: 'Original preserved' },
];

export default function Home() {
  return (
    <div className="text-[#e8e4dd]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#3a3530]">
        <div className="absolute inset-0 bg-radial-gold pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d4a574" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3a3530] bg-[#1f1a16] px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574]" />
              <span className="text-[#d4a574] text-[11px] font-mono tracking-widest uppercase">
                Powered by N3uralia Engine
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold mb-6 leading-[1.02] tracking-tight text-balance">
              Professional<br />
              <span className="text-gradient-gold">Image Upscaling</span>
            </h1>

            <p className="text-[#8b8278] text-lg md:text-xl mb-10 leading-relaxed text-pretty max-w-xl mx-auto lg:mx-0">
              Intelligent upscaling that preserves original quality while recovering fine
              detail. Built for creative professionals who demand precision.
            </p>

            <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#d4a574] text-[#1a1410] font-semibold text-sm hover:bg-[#e8d9c7] transition-all active:scale-95 shadow-lg shadow-[#d4a574]/20"
              >
                Open Studio
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/models"
                className="inline-flex items-center px-8 py-4 rounded-xl border border-[#3a3530] text-[#e8e4dd] font-semibold text-sm hover:border-[#d4a574] hover:text-[#d4a574] transition-colors active:scale-95"
              >
                Explore Models
              </Link>
            </div>
          </motion.div>

          {/* Before / After showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-2xl overflow-hidden border border-[#3a3530] shadow-2xl shadow-black/50">
              {/* Sharp (after) */}
              <img
                src="/showcase/cosmic-detail.png"
                alt="Intricate cosmic scene enhanced with Clar1ty showing crisp detail across thousands of luminous particles"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Blurred (before) clipped to left half */}
              <div className="absolute inset-0" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                <img
                  src="/showcase/cosmic-detail.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'blur(6px) brightness(0.85) saturate(0.9)' }}
                />
              </div>
              {/* Divider */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#d4a574] shadow-[0_0_12px_rgba(212,165,116,0.6)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#d4a574] flex items-center justify-center">
                  <SlidersHorizontal size={16} className="text-[#1a1410]" />
                </div>
              </div>
              {/* Labels */}
              <span className="absolute top-4 left-4 text-[11px] font-mono uppercase tracking-widest text-[#e8e4dd] bg-[#1a1410]/70 backdrop-blur px-2.5 py-1 rounded-md">
                Before
              </span>
              <span className="absolute top-4 right-4 text-[11px] font-mono uppercase tracking-widest text-[#d4a574] bg-[#1a1410]/70 backdrop-blur px-2.5 py-1 rounded-md">
                After
              </span>
            </div>
          </motion.div>
        </div>

        {/* Stats band */}
        <div className="relative z-10 border-t border-[#3a3530] bg-[#1f1a16]/60 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#3a3530]">
            {stats.map((s) => (
              <div key={s.label} className="py-8 px-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#d4a574] mb-1">{s.value}</div>
                <div className="text-[#8b8278] text-xs md:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Why Clar1ty</h2>
            <p className="text-[#8b8278] max-w-xl mx-auto leading-relaxed">
              Built on principles of clarity, precision, and professional-grade output.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                  className="bg-[#1f1a16] border border-[#3a3530] rounded-2xl p-7 hover:border-[#d4a574]/60 hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2d2620] flex items-center justify-center mb-5 group-hover:bg-[#d4a574]/15 transition-colors">
                    <Icon size={22} className="text-[#d4a574]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[#e8e4dd] font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-[#8b8278] text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-5xl mx-auto text-center rounded-3xl border border-[#3a3530] bg-[#1f1a16] px-6 py-20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-gold pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Ready to upscale?</h2>
            <p className="text-[#8b8278] text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              Upload your image and let N3uralia handle the rest. Professional results in seconds.
            </p>
            <Link
              href="/studio"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#d4a574] text-[#1a1410] font-semibold text-sm hover:bg-[#e8d9c7] transition-all active:scale-95 shadow-lg shadow-[#d4a574]/20"
            >
              Start for free
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
