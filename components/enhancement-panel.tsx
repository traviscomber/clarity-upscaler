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
      className="w-full bg-[#1f1a16] rounded-lg p-6 border border-[#3a3530]"
    >
      <h2 className="text-[#e8e4dd] font-semibold text-lg mb-6">Enhancement</h2>

      {/* Scale Factor Selection */}
      <div className="mb-6">
        <label className="block text-[#8b8278] text-sm mb-3">Scale</label>
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
                    ? 'bg-[#d4a574] text-[#1a1410]'
                    : 'bg-[#2d2620] text-[#e8e4dd] border border-[#3a3530] hover:border-[#d4a574]'
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
        <label className="block text-[#8b8278] text-sm mb-3">Model</label>
        <div className="p-3 bg-[#2d2620] rounded-lg border border-[#3a3530]">
          <p className="text-[#e8e4dd] font-medium text-sm">{strategy.model}</p>
        </div>
      </div>

      {/* Quality Target */}
      <div className="mb-6">
        <label className="block text-[#8b8278] text-sm mb-3">Quality Target</label>
        <div className="p-3 bg-[#2d2620] rounded-lg border border-[#3a3530]">
          <div className="flex items-center justify-between">
            <p className="text-[#e8e4dd] font-medium text-sm capitalize">
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
                        ? 'bg-[#d4a574]'
                        : 'bg-[#3a3530]'
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
              ? 'bg-[#3a3530] text-[#8b8278] cursor-not-allowed'
              : 'bg-[#d4a574] text-[#1a1410] hover:bg-[#d4a574] active:scale-95'
          }
        `}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#1a1410] border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          'ENHANCE IMAGE'
        )}
      </motion.button>
    </motion.div>
  );
}
