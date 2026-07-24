'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { EnhancementStrategy } from '@/lib/n3uralia/engine';
import { PHILZ_PRESETS, getPreset } from '@/lib/n3uralia/presets';

interface EnhancementPanelProps {
  strategy: EnhancementStrategy;
  onScaleChange: (scale: number) => void;
  onPresetChange?: (presetId: string) => void;
  onEnhance: () => void;
  isProcessing?: boolean;
  detectedContent?: string[];
  recommendedPresetId?: string;
  recommendedPresetReason?: string;
}

export default function EnhancementPanel({
  strategy,
  onScaleChange,
  onPresetChange,
  onEnhance,
  isProcessing,
  detectedContent = [],
  recommendedPresetId,
  recommendedPresetReason,
}: EnhancementPanelProps) {
  const [showPresets, setShowPresets] = useState(false);
  const scaleOptions = [2, 4, 8];
  
  const currentPreset = strategy.presetId
    ? getPreset(strategy.presetId)
    : getPreset('full_spectrum');
  
  const recommendedPreset = recommendedPresetId ? getPreset(recommendedPresetId) : null;
  const isUsingRecommended = strategy.presetId === recommendedPresetId;

  const handlePresetSelect = (presetId: string) => {
    onPresetChange?.(presetId);
    setShowPresets(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full bg-[#1f1a16] rounded-lg p-6 border border-[#3a3530]"
    >
      <h2 className="text-[#e8e4dd] font-semibold text-lg mb-6">Enhancement</h2>

      {/* Recommendation Banner */}
      {recommendedPreset && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border-2 transition-all ${
            isUsingRecommended
              ? 'bg-[#d4a574]/10 border-[#d4a574]'
              : 'bg-[#2d2620] border-[#3a3530] hover:border-[#d4a574]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[#d4a574] font-semibold text-sm">Recommended</p>
              <p className="text-[#e8e4dd] font-medium text-sm mt-1">{recommendedPreset.name}</p>
              <p className="text-[#8b8278] text-xs mt-2">{recommendedPresetReason}</p>
            </div>
            {!isUsingRecommended && recommendedPresetId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPresetChange?.(recommendedPresetId)}
                disabled={isProcessing}
                className="px-3 py-1.5 text-xs font-medium bg-[#d4a574] text-[#1a1410] rounded-md hover:bg-[#e8c3a1] transition-colors whitespace-nowrap"
              >
                Use This
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

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

      {/* Preset Selection */}
      <div className="mb-6">
        <label className="block text-[#8b8278] text-sm mb-3">Preset (Philz Profile)</label>
        <div className="relative">
          <motion.button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full p-3 bg-[#2d2620] rounded-lg border border-[#3a3530] hover:border-[#d4a574] transition-colors text-left flex items-center justify-between"
            whileHover={{ borderColor: '#d4a574' }}
            disabled={isProcessing}
          >
            <div>
              <p className="text-[#e8e4dd] font-medium text-sm">{currentPreset.name}</p>
              <p className="text-[#8b8278] text-xs mt-0.5">{currentPreset.description}</p>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#8b8278] transition-transform ${showPresets ? 'rotate-180' : ''}`}
            />
          </motion.button>

          {/* Preset Dropdown */}
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 w-full z-50 bg-[#2d2620] rounded-lg border border-[#3a3530] overflow-hidden shadow-lg"
            >
              {Object.values(PHILZ_PRESETS).map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`
                    w-full px-4 py-3 text-left border-b border-[#3a3530] last:border-b-0
                    transition-colors
                    ${
                      strategy.presetId === preset.id
                        ? 'bg-[#d4a574]/20 border-l-4 border-l-[#d4a574]'
                        : 'hover:bg-[#3a3530]'
                    }
                  `}
                  whileHover={{ paddingLeft: '1.25rem' }}
                >
                  <p className="text-[#e8e4dd] font-medium text-sm">{preset.name}</p>
                  <p className="text-[#8b8278] text-xs mt-1">{preset.description}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-[#d4a574]">C:{preset.creativity.toFixed(2)}</span>
                    <span className="text-[#d4a574]">R:{preset.resemblance.toFixed(2)}</span>
                    <span className="text-[#d4a574]">D:{preset.denoise_steps}</span>
                    <span className="text-[#d4a574]">S:{preset.sharpen.toFixed(1)}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Current Preset Parameters */}
          <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-[#1a1410] rounded-lg border border-[#3a3530]">
            <div>
              <p className="text-[#8b8278] text-xs">Creativity</p>
              <p className="text-[#d4a574] font-mono text-sm">{currentPreset.creativity.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[#8b8278] text-xs">Resemblance</p>
              <p className="text-[#d4a574] font-mono text-sm">{currentPreset.resemblance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[#8b8278] text-xs">Denoise Steps</p>
              <p className="text-[#d4a574] font-mono text-sm">{currentPreset.denoise_steps}</p>
            </div>
            <div>
              <p className="text-[#8b8278] text-xs">Sharpen</p>
              <p className="text-[#d4a574] font-mono text-sm">{currentPreset.sharpen.toFixed(1)}</p>
            </div>
          </div>
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
