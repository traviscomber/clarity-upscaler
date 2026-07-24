'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft, Eye, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const metricData = [
  {
    key: 'fidelity',
    label: 'Fidelity',
    value: 94,
    description: 'Color accuracy and tone preservation',
  },
  {
    key: 'detail',
    label: 'Detail Recovery',
    value: 87,
    description: 'Fine detail enhancement quality',
  },
  {
    key: 'preservation',
    label: 'Preservation',
    value: 91,
    description: 'Original content integrity',
  },
] as const;

const exportFormats = [
  { format: 'PNG', info: '13580 × 13580 · 8-bit lossless' },
  { format: 'TIFF', info: '13580 × 13580 · 16-bit lossless' },
  { format: 'WebP', info: '13580 × 13580 · 8-bit modern' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function ResultsPage() {
  const [activeMetric, setActiveMetric] = useState<'fidelity' | 'detail' | 'preservation'>('fidelity');
  const [showPreview, setShowPreview] = useState(false);



  const handleDownload = (format: string) => {
    // Simulate download with canvas-based image export
    const canvas = document.createElement('canvas');
    canvas.width = 13580;
    canvas.height = 13580;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background as placeholder
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#d4a574');
      gradient.addColorStop(1, '#2d2620');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      ctx.fillStyle = '#1a1410';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Enhanced Image', canvas.width / 2, canvas.height / 2);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clar1ty-enhanced.${format.toLowerCase()}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, `image/${format === 'TIFF' ? 'tiff' : format.toLowerCase()}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Clar1ty AI - Enhanced Image',
          text: 'Check out my upscaled image with Clar1ty AI Studio',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="text-[#e8e4dd]">
      {/* Page header */}
      <div className="border-b border-[#3a3530] bg-[#1f1a16] sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/studio"
            className="flex items-center gap-2 text-sm text-[#8b8278] hover:text-[#d4a574] transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Studio
          </Link>
          <h1 className="text-sm font-semibold text-[#e8e4dd]">Enhancement Results</h1>
          <div className="w-28" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* Comparison Viewer */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Before / After</h2>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#d4a574]/10 border border-[#d4a574]/30 rounded-lg text-sm text-[#d4a574] hover:bg-[#d4a574]/20 transition-colors"
              >
                <Eye size={16} />
                Full Preview
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Before/Original - Deteriorated Image */}
              <div className="relative rounded-xl overflow-hidden border border-[#3a3530] bg-[#1f1a16] aspect-square flex items-center justify-center">
                <img
                  src="/deteriorated-test.png"
                  alt="Before - Deteriorated"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#1a1410]/80 backdrop-blur-sm rounded-md text-xs text-[#e8e4dd] border border-[#3a3530] font-medium">
                  Before
                </div>
              </div>

              {/* After/Enhanced - N3uralia Processed */}
              <div className="relative rounded-xl overflow-hidden border border-[#3a3530] bg-[#1f1a16] aspect-square flex items-center justify-center">
                <img
                  src="/processed-result.png"
                  alt="After - N3uralia Processed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#d4a574]/20 backdrop-blur-sm rounded-md text-xs text-[#d4a574] border border-[#d4a574]/30 font-medium">
                  After
                </div>
              </div>
            </div>
          </motion.section>

          {/* Quality Metrics */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Quality Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricData.map(({ key, label, value, description }) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveMetric(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl border text-left transition-colors ${
                    activeMetric === key
                      ? 'bg-[#d4a574]/8 border-[#d4a574]'
                      : 'bg-[#1f1a16] border-[#3a3530] hover:border-[#d4a574]/40'
                  }`}
                >
                  <div className="space-y-3">
                    <p className="text-xs text-[#8b8278] uppercase tracking-wider">{label}</p>
                    <p className="text-4xl font-light text-[#d4a574]">{value}%</p>
                    <div className="w-full h-0.5 bg-[#3a3530] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#d4a574]"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-[#8b8278] leading-relaxed">{description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Enhancement Details */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Enhancement Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Original Resolution', value: '3395 × 3395', accent: false },
                { label: 'Enhanced Resolution', value: '13580 × 13580', accent: true },
                { label: 'Scale Factor', value: '4×', accent: false },
                { label: 'Processing Time', value: '3.2s', accent: false },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="p-5 bg-[#1f1a16] border border-[#3a3530] rounded-xl"
                >
                  <p className="text-xs text-[#8b8278] mb-2 uppercase tracking-wider">{label}</p>
                  <p className={`text-base font-light ${accent ? 'text-[#d4a574]' : 'text-[#e8e4dd]'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Export */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Export</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportFormats.map(({ format, info }) => (
                <motion.button
                  key={format}
                  onClick={() => handleDownload(format)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-5 border border-[#3a3530] rounded-xl hover:border-[#d4a574]/50 hover:bg-[#d4a574]/5 transition-colors flex items-center justify-between group"
                >
                  <div className="text-left">
                    <p className="font-semibold text-sm text-[#e8e4dd]">{format}</p>
                    <p className="text-xs text-[#8b8278] mt-0.5">{info}</p>
                  </div>
                  <Download
                    size={17}
                    className="text-[#8b8278] group-hover:text-[#d4a574] transition-colors flex-shrink-0"
                    strokeWidth={1.5}
                  />
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex gap-4 pt-2">
            <button
              onClick={() => handleDownload('PNG')}
              className="flex-1 px-6 py-3.5 bg-[#d4a574] text-[#1a1410] rounded-lg font-semibold text-sm hover:bg-[#e8d9c7] transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
            >
              <Download size={16} strokeWidth={2} />
              Download Enhanced Image
            </button>
            <button
              onClick={handleShare}
              className="flex-1 px-6 py-3.5 border border-[#3a3530] rounded-lg text-sm hover:border-[#d4a574]/50 hover:text-[#d4a574] transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
            >
              <Share2 size={16} strokeWidth={1.5} />
              Share Results
            </button>
          </motion.div>

          {/* Full Preview Modal */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full bg-[#1f1a16] rounded-xl border border-[#3a3530] overflow-hidden"
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#3a3530]">
                  <h3 className="text-lg font-semibold text-[#e8e4dd]">Enhanced Image Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-[#3a3530] rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="bg-[#2d2620] aspect-video flex items-center justify-center max-h-[70vh] overflow-auto">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-lg bg-gradient-to-br from-[#d4a574]/20 to-[#3a3530] border border-[#d4a574]/30 flex items-center justify-center">
                      <Eye size={48} className="text-[#d4a574]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold text-[#e8e4dd]">13580 × 13580px</p>
                      <p className="text-sm text-[#8b8278]">High-resolution enhanced image</p>
                    </div>
                  </div>
                </div>

                {/* Download from Preview */}
                <div className="p-4 border-t border-[#3a3530] flex gap-3">
                  {exportFormats.map(({ format }) => (
                    <button
                      key={format}
                      onClick={() => {
                        handleDownload(format);
                        setShowPreview(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-[#d4a574] text-[#1a1410] rounded-lg font-semibold text-sm hover:bg-[#e8d9c7] transition-colors"
                    >
                      Download {format}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
