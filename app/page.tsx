'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F2]">
      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#262626] bg-[#101010]"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#FFFFFF]">Clar1ty</h1>
          <nav className="flex gap-8">
            <Link
              href="/studio"
              className="px-4 py-2 text-[#F5F5F2] hover:text-[#7FE7D8] transition-colors"
            >
              Studio
            </Link>
            <Link
              href="/models"
              className="px-4 py-2 text-[#F5F5F2] hover:text-[#7FE7D8] transition-colors"
            >
              Models
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 overflow-hidden"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#7FE7D8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-[#7FE7D8] text-sm font-mono mb-6"
          >
            Powered by N3uralia Engine
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance">
            Professional Image{' '}
            <span className="bg-gradient-to-r from-[#7FE7D8] to-[#5B8CFF] bg-clip-text text-transparent">
              Upscaling
            </span>
          </h1>

          <p className="text-[#8A8A8A] text-xl md:text-2xl mb-12 text-balance max-w-2xl mx-auto">
            Intelligent upscaling that preserves original quality while enhancing
            detail. Built for creative professionals who demand precision.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link
              href="/studio"
              className="
                px-8 py-4 rounded-lg bg-[#5B8CFF] text-[#050505] font-semibold
                hover:bg-[#7FE7D8] transition-all transform hover:scale-105
                active:scale-95 shadow-lg hover:shadow-xl
              "
            >
              Launch Studio
            </Link>
            <Link
              href="/models"
              className="
                px-8 py-4 rounded-lg border border-[#262626] text-[#F5F5F2] font-semibold
                hover:border-[#5B8CFF] transition-all transform hover:scale-105
                active:scale-95
              "
            >
              Explore Models
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-24 px-6 border-t border-[#262626]"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Choose Clar1ty
          </h2>
          <p className="text-[#8A8A8A] text-center max-w-2xl mx-auto mb-16">
            Built on principles of clarity, precision, and professional-grade quality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Smart Analysis',
                description:
                  'AI automatically detects content and recommends optimal enhancement strategies.',
                icon: '🔍',
              },
              {
                title: 'Quality Metrics',
                description:
                  'Real-time fidelity, detail, and preservation scores for every enhancement.',
                icon: '📊',
              },
              {
                title: 'Multiple Models',
                description:
                  'Specialized models for architecture, nature, portraits, and more.',
                icon: '🧬',
              },
              {
                title: 'Preservation Focus',
                description:
                  'Never destroys original data. Upscaling enhances without loss.',
                icon: '🛡️',
              },
              {
                title: 'Fast Processing',
                description:
                  'Optimized for speed without compromising on quality or detail.',
                icon: '⚡',
              },
              {
                title: 'Professional Workflow',
                description:
                  'Built for creative professionals. Before/after comparisons and batch operations.',
                icon: '🎨',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-[#101010] border border-[#262626] rounded-lg p-8 hover:border-[#5B8CFF] transition-all"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-[#F5F5F2] font-semibold text-lg mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#8A8A8A]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-24 px-6 bg-[#101010] border-t border-[#262626]"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Upscale?</h2>
          <p className="text-[#8A8A8A] text-lg mb-12 max-w-2xl mx-auto">
            Upload your image and let N3uralia do the work. Professional results in
            seconds.
          </p>
          <Link
            href="/studio"
            className="
              inline-block px-8 py-4 rounded-lg bg-[#7FE7D8] text-[#050505] font-semibold
              hover:bg-[#FFFFFF] transition-all transform hover:scale-105
              active:scale-95 shadow-lg hover:shadow-xl
            "
          >
            Start Upscaling Now
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#050505] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-[#F5F5F2] font-semibold mb-4">Clar1ty</h3>
              <p className="text-[#8A8A8A] text-sm">
                Professional image upscaling powered by N3uralia.
              </p>
            </div>
            <div>
              <h4 className="text-[#F5F5F2] font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[#8A8A8A] text-sm">
                <li>
                  <Link href="/studio" className="hover:text-[#7FE7D8] transition-colors">
                    Studio
                  </Link>
                </li>
                <li>
                  <Link href="/models" className="hover:text-[#7FE7D8] transition-colors">
                    Models
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#F5F5F2] font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-[#8A8A8A] text-sm">
                <li>
                  <a href="#" className="hover:text-[#7FE7D8] transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#7FE7D8] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#262626] pt-8 text-center text-[#8A8A8A] text-sm">
            <p>&copy; 2024 Clar1ty. All rights reserved. Powered by N3uralia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
