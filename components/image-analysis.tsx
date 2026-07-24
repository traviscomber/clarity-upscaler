'use client';

import { motion } from 'framer-motion';
import type { ImageAnalysis } from '@/lib/n3uralia/engine';

interface ImageAnalysisProps {
  analysis: ImageAnalysis;
}

export default function ImageAnalysisPanel({ analysis }: ImageAnalysisProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ultra':
        return 'text-[#d4a574]';
      case 'high':
        return 'text-[#d4a574]';
      case 'medium':
        return 'text-[#e8e4dd]';
      default:
        return 'text-[#8b8278]';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-[#1f1a16] rounded-lg p-6 border border-[#3a3530]"
    >
      <h2 className="text-[#e8e4dd] font-semibold text-lg mb-4">AI Analysis</h2>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[#8b8278] text-sm mb-1">Architecture</p>
          <p className="text-[#e8e4dd] font-medium">{analysis.resolution}</p>
        </div>
        <div>
          <p className="text-[#8b8278] text-sm mb-1">Quality</p>
          <p className={`font-medium capitalize ${getQualityColor(analysis.quality)}`}>
            {analysis.quality}
          </p>
        </div>
        <div>
          <p className="text-[#8b8278] text-sm mb-1">Megapixels</p>
          <p className="text-[#e8e4dd] font-medium">{analysis.megapixels} MP</p>
        </div>
        <div>
          <p className="text-[#8b8278] text-sm mb-1">Confidence</p>
          <p className="text-[#e8e4dd] font-medium">{Math.round(analysis.confidence * 100)}%</p>
        </div>
      </motion.div>

      {analysis.detectedContent.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-[#8b8278] text-sm mb-2">Detected Content</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {analysis.detectedContent.map((content) => (
              <span
                key={content}
                className="px-3 py-1 bg-[#2d2620] text-[#d4a574] text-xs rounded-full border border-[#3a3530]"
              >
                {content}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {analysis.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-[#8b8278] text-sm mb-2">Recommended</p>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 bg-[#2d2620] rounded-lg border border-[#3a3530]"
              >
                <div className="w-1 h-1 rounded-full bg-[#d4a574] mt-2 flex-shrink-0" />
                <p className="text-[#e8e4dd] text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
