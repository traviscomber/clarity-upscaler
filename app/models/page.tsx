'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getPresets } from '@/lib/n3uralia/engine';

export default function ModelsPage() {
  const presets = getPresets();

  const models = [
    {
      id: 'architecture',
      name: 'Architecture v1',
      description:
        'Specialized for architectural photography and building details. Preserves geometric precision.',
      use_cases: ['Building exteriors', 'Interior spaces', 'Architectural details'],
      strengths: ['Sharp edges', 'Geometric preservation', 'Fine details'],
      recommended_scale: '2x',
    },
    {
      id: 'nature',
      name: 'Nature Enhanced',
      description:
        'Optimized for landscape and nature photography. Enhances organic textures naturally.',
      use_cases: ['Landscapes', 'Wildlife', 'Nature photography'],
      strengths: ['Texture detail', 'Color accuracy', 'Natural enhancement'],
      recommended_scale: '4x',
    },
    {
      id: 'face',
      name: 'Face Restoration',
      description:
        'Specialized for portrait and facial detail enhancement. Preserves skin texture and features.',
      use_cases: ['Portraits', 'Headshots', 'Wedding photography'],
      strengths: ['Facial features', 'Skin texture', 'Eye detail'],
      recommended_scale: '2x',
    },
    {
      id: 'clean',
      name: 'Clean Detail',
      description:
        'Fast, general-purpose upscaling. Best for quick enhancements without specialized needs.',
      use_cases: ['General use', 'Product photography', 'Web images'],
      strengths: ['Speed', 'Versatility', 'Balance'],
      recommended_scale: '2x',
    },
    {
      id: 'full',
      name: 'Full Spectrum',
      description:
        'Comprehensive model handling all image types. Adapts to content automatically.',
      use_cases: ['Mixed content', 'Unknown subjects', 'All-purpose'],
      strengths: ['Adaptability', 'Quality', 'Versatility'],
      recommended_scale: '2-4x',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-[#1a1410] text-[#e8e4dd]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#3a3530] bg-[#1f1a16]"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#FFFFFF]">Clar1ty</h1>
          <nav className="flex gap-8">
            <Link
              href="/"
              className="px-4 py-2 text-[#e8e4dd] hover:text-[#d4a574] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/studio"
              className="px-4 py-2 text-[#e8e4dd] hover:text-[#d4a574] transition-colors"
            >
              Studio
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#3a3530] bg-[#1f1a16] py-12 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">N3uralia Models</h2>
          <p className="text-[#8b8278] max-w-2xl">
            Specialized upscaling models trained for different types of content.
            Choose the right model for your image to get the best results.
          </p>
        </div>
      </motion.section>

      {/* Models Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {models.map((model) => (
            <motion.div key={model.id} variants={item}>
              <motion.div
                whileHover={{ y: -8 }}
                className="h-full bg-[#1f1a16] border border-[#3a3530] rounded-lg p-8 hover:border-[#d4a574] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-[#e8e4dd] font-semibold text-xl">
                    {model.name}
                  </h3>
                  <span className="px-3 py-1 bg-[#2d2620] text-[#d4a574] text-xs rounded-full">
                    {model.recommended_scale} upscale
                  </span>
                </div>

                <p className="text-[#8b8278] text-sm mb-6">{model.description}</p>

                {/* Use Cases */}
                <div className="mb-4">
                  <h4 className="text-[#e8e4dd] font-medium text-sm mb-2">
                    Best For:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {model.use_cases.map((use_case) => (
                      <span
                        key={use_case}
                        className="px-2 py-1 bg-[#2d2620] text-[#e8e4dd] text-xs rounded"
                      >
                        {use_case}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="text-[#e8e4dd] font-medium text-sm mb-2">
                    Strengths:
                  </h4>
                  <ul className="space-y-1">
                    {model.strengths.map((strength) => (
                      <li
                        key={strength}
                        className="text-[#8b8278] text-sm flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-[#d4a574] rounded-full" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    w-full mt-6 px-4 py-2 rounded-lg
                    bg-[#d4a574] text-[#1a1410] font-medium text-sm
                    hover:bg-[#d4a574] transition-all
                  "
                  onClick={() => (window.location.href = '/studio')}
                >
                  Try This Model
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="border-t border-[#3a3530] pt-16"
        >
          <h2 className="text-3xl font-bold mb-8">Model Comparison</h2>

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="bg-[#1f1a16] border border-[#3a3530] rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#3a3530] bg-[#2d2620]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-[#e8e4dd]">
                      Model
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#e8e4dd]">
                      Speed
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#e8e4dd]">
                      Quality
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#e8e4dd]">
                      Preservation
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#e8e4dd]">
                      Versatility
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, idx) => (
                    <motion.tr
                      key={model.id}
                      variants={item}
                      className={idx % 2 === 0 ? 'bg-[#1f1a16]' : 'bg-[#2d2620]'}
                    >
                      <td className="px-6 py-4 font-medium text-[#e8e4dd]">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 text-[#8b8278]">⚡⚡⚡</td>
                      <td className="px-6 py-4 text-[#8b8278]">⭐⭐⭐⭐⭐</td>
                      <td className="px-6 py-4 text-[#8b8278]">⭐⭐⭐⭐</td>
                      <td className="px-6 py-4 text-[#8b8278]">
                        {model.id === 'full' ? '🌐' : '🎯'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to upscale?</h2>
          <Link
            href="/studio"
            className="
              inline-block px-8 py-4 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold
              hover:bg-[#FFFFFF] transition-all transform hover:scale-105
              active:scale-95
            "
          >
            Launch Studio
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3a3530] bg-[#1a1410] py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-[#e8e4dd] font-semibold mb-4">Clar1ty</h3>
              <p className="text-[#8b8278] text-sm">
                Professional image upscaling powered by N3uralia.
              </p>
            </div>
            <div>
              <h4 className="text-[#e8e4dd] font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[#8b8278] text-sm">
                <li>
                  <Link href="/studio" className="hover:text-[#d4a574] transition-colors">
                    Studio
                  </Link>
                </li>
                <li>
                  <Link href="/models" className="hover:text-[#d4a574] transition-colors">
                    Models
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#e8e4dd] font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-[#8b8278] text-sm">
                <li>
                  <a href="#" className="hover:text-[#d4a574] transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4a574] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#3a3530] pt-8 text-center text-[#8b8278] text-sm">
            <p>&copy; 2024 Clar1ty. All rights reserved. Powered by N3uralia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
