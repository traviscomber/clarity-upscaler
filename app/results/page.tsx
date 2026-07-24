'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResultsPage() {
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [activeMetric, setActiveMetric] = useState<'fidelity' | 'detail' | 'preservation'>('fidelity');

  const metrics = {
    fidelity: { label: 'Fidelity', value: 94, description: 'Color accuracy and tone preservation' },
    detail: { label: 'Detail Recovery', value: 87, description: 'Fine detail enhancement quality' },
    preservation: { label: 'Preservation Score', value: 91, description: 'Original content integrity' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/studio" className="flex items-center gap-2 text-sm hover:text-accent-gold transition-colors">
            <ArrowLeft size={16} />
            Back to Studio
          </Link>
          <h1 className="text-lg font-semibold">Enhancement Results</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Comparison Viewer */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl font-light tracking-wide">Before / After Comparison</h2>
            
            <div className="relative w-full bg-surface-elevated rounded-lg overflow-hidden border border-border group">
              <div className="relative w-full aspect-video bg-muted">
                {/* Before Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-elevated flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded bg-border/50" />
                    <p className="text-sm text-muted">Original: 3395 × 3395px</p>
                  </div>
                </div>

                {/* After Image (Comparison overlay) */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 overflow-hidden"
                  style={{ width: `${comparisonPosition}%` }}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto rounded bg-accent-gold/30" />
                      <p className="text-sm text-accent-gold">Enhanced: 13580 × 13580px</p>
                    </div>
                  </div>
                </div>

                {/* Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-accent-gold cursor-col-resize hover:w-2 transition-all"
                  style={{ left: `${comparisonPosition}%` }}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                      const newPosition = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                      setComparisonPosition(newPosition);
                    }
                  }}
                />

                {/* Label badges */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-surface/80 backdrop-blur rounded text-sm border border-border">
                  Original
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-accent-gold/20 backdrop-blur rounded text-sm border border-accent-gold/30">
                  Enhanced
                </div>
              </div>
            </div>
          </motion.section>

          {/* Quality Metrics */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-light tracking-wide">Quality Metrics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['fidelity', 'detail', 'preservation'] as const).map((metric) => (
                <motion.button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-lg border transition-all ${
                    activeMetric === metric
                      ? 'bg-accent-gold/10 border-accent-gold'
                      : 'bg-surface border-border hover:border-accent-gold/50'
                  }`}
                >
                  <div className="text-left space-y-3">
                    <div className="text-sm text-muted">{metrics[metric].label}</div>
                    <div className="text-3xl font-light text-accent-gold">{metrics[metric].value}%</div>
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics[metric].value}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <p className="text-xs text-muted/70">{metrics[metric].description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Export Options */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl font-light tracking-wide">Export</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['PNG', 'TIFF', 'WebP'].map((format) => (
                <motion.button
                  key={format}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(212, 165, 116, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 border border-border rounded-lg hover:border-accent-gold transition-colors flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-medium">{format}</div>
                    <div className="text-xs text-muted">13580 × 13580 @ 8-bit</div>
                  </div>
                  <Download size={18} className="text-muted group-hover:text-accent-gold transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Enhancement Details */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl font-light tracking-wide">Enhancement Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-surface border border-border rounded-lg">
                <div className="text-xs text-muted mb-1">Original Resolution</div>
                <div className="text-lg font-light">3395 × 3395</div>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg">
                <div className="text-xs text-muted mb-1">Enhanced Resolution</div>
                <div className="text-lg font-light text-accent-gold">13580 × 13580</div>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg">
                <div className="text-xs text-muted mb-1">Scale Factor</div>
                <div className="text-lg font-light">4×</div>
              </div>
              <div className="p-4 bg-surface border border-border rounded-lg">
                <div className="text-xs text-muted mb-1">Processing Time</div>
                <div className="text-lg font-light">3.2s</div>
              </div>
            </div>
          </motion.section>

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex gap-4 pt-4"
          >
            <button className="flex-1 px-6 py-3 bg-accent-gold text-background rounded-lg font-medium hover:bg-accent-gold-light transition-colors flex items-center justify-center gap-2">
              <Download size={18} />
              Download Enhanced Image
            </button>
            <button className="flex-1 px-6 py-3 border border-border rounded-lg hover:border-accent-gold hover:text-accent-gold transition-colors flex items-center justify-center gap-2">
              <Share2 size={18} />
              Share Results
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
