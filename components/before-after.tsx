'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  metrics?: {
    fidelity: number;
    detail: number;
    preservation: number;
  };
}

export default function BeforeAfter({ beforeImage, afterImage, metrics }: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const MetricBar = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#8b8278] text-xs">{label}</span>
        <span className="text-[#e8e4dd] font-semibold text-xs">{Math.round(value * 100)}%</span>
      </div>
      <div className="w-full h-1 bg-[#3a3530] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-[#d4a574] to-[#d4a574]"
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="w-full bg-[#1f1a16] rounded-lg p-6 border border-[#3a3530]"
    >
      <h2 className="text-[#e8e4dd] font-semibold text-lg mb-4">Result</h2>

      {/* Before/After Slider */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full rounded-lg overflow-hidden mb-6 cursor-col-resize bg-[#2d2620]"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <img src={beforeImage} alt="Original" className="w-full h-full object-cover" />
        </div>

        {/* After Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img src={afterImage} alt="Enhanced" className="w-full h-full object-cover" />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#d4a574] cursor-col-resize"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-[#d4a574] rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-[#1a1410]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-[#1a1410] bg-opacity-70 rounded text-[#e8e4dd] text-xs font-medium">
          Before
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-[#1a1410] bg-opacity-70 rounded text-[#e8e4dd] text-xs font-medium">
          After
        </div>
      </div>

      {/* Quality Metrics */}
      {metrics && (
        <div className="space-y-3">
          <MetricBar label="Fidelity" value={metrics.fidelity} />
          <MetricBar label="Detail" value={metrics.detail} />
          <MetricBar label="Preservation" value={metrics.preservation} />
        </div>
      )}
    </motion.div>
  );
}
