'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cpu, BarChart3, Layers, Shield, Zap, SlidersHorizontal } from 'lucide-react';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function Home() {
  return (
    <div className="text-[#e8e4dd]">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-24 overflow-hidden">
        {/* Subtle grid */}
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#d4a574] text-xs font-mono tracking-widest uppercase mb-6"
          >
            Powered by N3uralia Engine
          </motion.p>

          <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-[1.05] text-balance tracking-tight">
            Professional<br />
            <span className="text-[#d4a574]">Image Upscaling</span>
          </h1>

          <p className="text-[#8b8278] text-lg md:text-xl mb-12 leading-relaxed text-balance max-w-2xl mx-auto">
            Intelligent upscaling that preserves original quality while recovering fine detail.
            Built for creative professionals who demand precision.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/studio"
              className="px-8 py-3.5 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold text-sm hover:bg-[#e8d9c7] transition-colors active:scale-95 transform"
            >
              Open Studio
            </Link>
            <Link
              href="/models"
              className="px-8 py-3.5 rounded-lg border border-[#3a3530] text-[#e8e4dd] font-semibold text-sm hover:border-[#d4a574] hover:text-[#d4a574] transition-colors active:scale-95 transform"
            >
              Explore Models
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-[#3a3530]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-balance">
              Why Clar1ty
            </h2>
            <p className="text-[#8b8278] max-w-xl mx-auto leading-relaxed">
              Built on principles of clarity, precision, and professional-grade output.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-[#1f1a16] border border-[#3a3530] rounded-xl p-7 hover:border-[#d4a574]/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#2d2620] flex items-center justify-center mb-5 group-hover:bg-[#d4a574]/10 transition-colors">
                    <Icon size={20} className="text-[#d4a574]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[#e8e4dd] font-semibold text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#8b8278] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#1f1a16] border-t border-[#3a3530]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-balance">
            Ready to upscale?
          </h2>
          <p className="text-[#8b8278] text-lg mb-10 leading-relaxed">
            Upload your image and let N3uralia handle the rest. Professional results in seconds.
          </p>
          <Link
            href="/studio"
            className="inline-block px-10 py-3.5 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold text-sm hover:bg-[#e8d9c7] transition-colors active:scale-95 transform"
          >
            Start for free
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
