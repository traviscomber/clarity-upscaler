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
        return 'text-[#7FE7D8]';
      case 'high':
        return 'text-[#5B8CFF]';
      case 'medium':
        return 'text-[#F5F5F2]';
      default:
        return 'text-[#8A8A8A]';
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
      className="w-full bg-[#101010] rounded-lg p-6 border border-[#262626]"
    >
      <h2 className="text-[#F5F5F2] font-semibold text-lg mb-4">AI Analysis</h2>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[#8A8A8A] text-sm mb-1">Architecture</p>
          <p className="text-[#F5F5F2] font-medium">{analysis.resolution}</p>
        </div>
        <div>
          <p className="text-[#8A8A8A] text-sm mb-1">Quality</p>
          <p className={`font-medium capitalize ${getQualityColor(analysis.quality)}`}>
            {analysis.quality}
          </p>
        </div>
        <div>
          <p className="text-[#8A8A8A] text-sm mb-1">Megapixels</p>
          <p className="text-[#F5F5F2] font-medium">{analysis.megapixels} MP</p>
        </div>
        <div>
          <p className="text-[#8A8A8A] text-sm mb-1">Confidence</p>
          <p className="text-[#F5F5F2] font-medium">{Math.round(analysis.confidence * 100)}%</p>
        </div>
      </motion.div>

      {analysis.detectedContent.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-[#8A8A8A] text-sm mb-2">Detected Content</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {analysis.detectedContent.map((content) => (
              <span
                key={content}
                className="px-3 py-1 bg-[#171717] text-[#7FE7D8] text-xs rounded-full border border-[#262626]"
              >
                {content}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {analysis.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-[#8A8A8A] text-sm mb-2">Recommended</p>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 bg-[#171717] rounded-lg border border-[#262626]"
              >
                <div className="w-1 h-1 rounded-full bg-[#5B8CFF] mt-2 flex-shrink-0" />
                <p className="text-[#F5F5F2] text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
