'use client';

import { motion } from 'framer-motion';
import type { EnhancementStrategy } from '@/lib/n3uralia/engine';

interface EnhancementPanelProps {
  strategy: EnhancementStrategy;
  onScaleChange: (scale: number) => void;
  onEnhance: () => void;
  isProcessing?: boolean;
}

export default function EnhancementPanel({
  strategy,
  onScaleChange,
  onEnhance,
  isProcessing,
}: EnhancementPanelProps) {
  const scaleOptions = [2, 4, 8];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full bg-[#101010] rounded-lg p-6 border border-[#262626]"
    >
      <h2 className="text-[#F5F5F2] font-semibold text-lg mb-6">Enhancement</h2>

      {/* Scale Factor Selection */}
      <div className="mb-6">
        <label className="block text-[#8A8A8A] text-sm mb-3">Scale</label>
        <div className="flex gap-2 mb-2">
          {scaleOptions.map((scale) => (
            <motion.button
              key={scale}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onScaleChange(scale)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  strategy.scaleFactor === scale
                    ? 'bg-[#5B8CFF] text-[#050505]'
                    : 'bg-[#171717] text-[#F5F5F2] border border-[#262626] hover:border-[#5B8CFF]'
                }
              `}
              disabled={isProcessing}
            >
              {scale}x
            </motion.button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-[#8A8A8A] text-sm mb-3">Model</label>
        <div className="p-3 bg-[#171717] rounded-lg border border-[#262626]">
          <p className="text-[#F5F5F2] font-medium text-sm">{strategy.model}</p>
        </div>
      </div>

      {/* Quality Target */}
      <div className="mb-6">
        <label className="block text-[#8A8A8A] text-sm mb-3">Quality Target</label>
        <div className="p-3 bg-[#171717] rounded-lg border border-[#262626]">
          <div className="flex items-center justify-between">
            <p className="text-[#F5F5F2] font-medium text-sm capitalize">
              {strategy.qualityTarget}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`
                    h-1 w-6 rounded-full
                    ${
                      i <=
                      (strategy.qualityTarget === 'speed'
                        ? 1
                        : strategy.qualityTarget === 'balanced'
                          ? 2
                          : 3)
                        ? 'bg-[#7FE7D8]'
                        : 'bg-[#262626]'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhance Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEnhance}
        disabled={isProcessing}
        className={`
          w-full py-3 rounded-lg font-medium text-sm transition-all
          ${
            isProcessing
              ? 'bg-[#262626] text-[#8A8A8A] cursor-not-allowed'
              : 'bg-[#5B8CFF] text-[#050505] hover:bg-[#7FE7D8] active:scale-95'
          }
        `}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          'ENHANCE IMAGE'
        )}
      </motion.button>
    </motion.div>
  );
}
