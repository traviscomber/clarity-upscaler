'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, TreePine, User, Zap, Globe, CheckCircle } from 'lucide-react';

const models = [
  {
    id: 'architecture',
    name: 'Architecture v1',
    description:
      'Specialized for architectural photography and building details. Preserves geometric precision and hard edges without ringing artifacts.',
    use_cases: ['Building exteriors', 'Interior spaces', 'Architectural details'],
    strengths: ['Sharp edges', 'Geometric preservation', 'Fine structural detail'],
    recommended_scale: '2×',
    icon: Building2,
  },
  {
    id: 'nature',
    name: 'Nature Enhanced',
    description:
      'Optimized for landscape and nature photography. Enhances organic textures while maintaining color fidelity.',
    use_cases: ['Landscapes', 'Wildlife', 'Macro photography'],
    strengths: ['Texture detail', 'Color accuracy', 'Natural enhancement'],
    recommended_scale: '4×',
    icon: TreePine,
  },
  {
    id: 'face',
    name: 'Face Restoration',
    description:
      'Specialized for portrait and facial detail enhancement. Recovers skin texture and facial features without over-smoothing.',
    use_cases: ['Portraits', 'Headshots', 'Wedding photography'],
    strengths: ['Facial features', 'Skin texture', 'Eye detail'],
    recommended_scale: '2×',
    icon: User,
  },
  {
    id: 'clean',
    name: 'Clean Detail',
    description:
      'Fast, general-purpose upscaling for quick enhancements without specialized needs. Optimized inference path.',
    use_cases: ['General use', 'Product photography', 'Web images'],
    strengths: ['Processing speed', 'Versatility', 'Consistent output'],
    recommended_scale: '2×',
    icon: Zap,
  },
  {
    id: 'full',
    name: 'Full Spectrum',
    description:
      'Comprehensive model that handles all image types. Automatically adapts its enhancement strategy to detected content.',
    use_cases: ['Mixed content', 'Unknown subjects', 'All-purpose'],
    strengths: ['Adaptability', 'Maximum quality', 'Content awareness'],
    recommended_scale: '2–4×',
    icon: Globe,
  },
];

const tableData = [
  { model: 'Architecture v1', speed: 3, quality: 4, preservation: 5, versatility: 2 },
  { model: 'Nature Enhanced', speed: 3, quality: 5, preservation: 4, versatility: 3 },
  { model: 'Face Restoration', speed: 3, quality: 5, preservation: 5, versatility: 2 },
  { model: 'Clean Detail',     speed: 5, quality: 3, preservation: 3, versatility: 4 },
  { model: 'Full Spectrum',    speed: 2, quality: 5, preservation: 5, versatility: 5 },
];

const RatingDots = ({ value, max = 5 }: { value: number; max?: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-colors ${i < value ? 'bg-[#d4a574]' : 'bg-[#3a3530]'}`}
      />
    ))}
  </div>
);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.4 },
  }),
};

export default function ModelsPage() {
  return (
    <div className="text-[#e8e4dd]">
      {/* Page header */}
      <div className="border-b border-[#3a3530] bg-[#1f1a16]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#d4a574] text-xs font-mono tracking-widest uppercase mb-3">
              N3uralia Engine
            </p>
            <h1 className="text-4xl font-semibold mb-3 tracking-tight">Models</h1>
            <p className="text-[#8b8278] max-w-xl leading-relaxed">
              Specialized upscaling models trained for specific content types.
              Choose the right model to maximize fidelity and preservation.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Models grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {models.map((model, i) => {
            const Icon = model.icon;
            return (
              <motion.div
                key={model.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-[#1f1a16] border border-[#3a3530] rounded-xl p-7 flex flex-col hover:border-[#d4a574]/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2d2620] flex items-center justify-center group-hover:bg-[#d4a574]/10 transition-colors">
                      <Icon size={19} className="text-[#d4a574]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[#e8e4dd] font-semibold text-base">
                      {model.name}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-[#2d2620] text-[#d4a574] text-xs rounded-full font-mono flex-shrink-0">
                    {model.recommended_scale}
                  </span>
                </div>

                <p className="text-[#8b8278] text-sm leading-relaxed mb-6 flex-1">
                  {model.description}
                </p>

                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div>
                    <p className="text-[#e8e4dd] text-xs font-medium mb-2 uppercase tracking-wider">Best for</p>
                    <ul className="space-y-1.5">
                      {model.use_cases.map((u) => (
                        <li key={u} className="text-[#8b8278] text-xs flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#3a3530] flex-shrink-0" />
                          {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[#e8e4dd] text-xs font-medium mb-2 uppercase tracking-wider">Strengths</p>
                    <ul className="space-y-1.5">
                      {model.strengths.map((s) => (
                        <li key={s} className="text-[#8b8278] text-xs flex items-center gap-2">
                          <CheckCircle size={11} className="text-[#d4a574] flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href="/studio"
                  className="w-full py-2.5 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold text-sm text-center hover:bg-[#e8d9c7] transition-colors active:scale-95 transform block"
                >
                  Use this model
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison table */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Model Comparison</h2>

          <div className="bg-[#1f1a16] border border-[#3a3530] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3a3530] bg-[#2d2620]">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b8278] uppercase tracking-wider">Model</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b8278] uppercase tracking-wider">Speed</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b8278] uppercase tracking-wider">Quality</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b8278] uppercase tracking-wider">Preservation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8b8278] uppercase tracking-wider">Versatility</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(({ model, speed, quality, preservation, versatility }, idx) => (
                    <tr
                      key={model}
                      className={`border-b border-[#3a3530] last:border-0 ${idx % 2 === 0 ? '' : 'bg-[#1f1a16]/50'}`}
                    >
                      <td className="px-6 py-4 font-medium text-[#e8e4dd] text-sm">{model}</td>
                      <td className="px-6 py-4"><RatingDots value={speed} /></td>
                      <td className="px-6 py-4"><RatingDots value={quality} /></td>
                      <td className="px-6 py-4"><RatingDots value={preservation} /></td>
                      <td className="px-6 py-4"><RatingDots value={versatility} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <h2 className="text-2xl font-semibold mb-3">Ready to enhance your images?</h2>
          <p className="text-[#8b8278] mb-8 text-sm leading-relaxed">
            The engine auto-selects the best model based on your image content.
          </p>
          <Link
            href="/studio"
            className="inline-block px-10 py-3.5 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold text-sm hover:bg-[#e8d9c7] transition-colors active:scale-95 transform"
          >
            Open Studio
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
