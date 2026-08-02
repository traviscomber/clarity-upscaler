'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  metrics?: {
    fidelity: number;
    detail: number;
    preservation: number;
  };
}

function getDownloadExtension(dataUrl: string): string {
  const mimeType = dataUrl.match(/^data:([^;,]+)/)?.[1];

  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/tiff') return 'tiff';
  return 'png';
}

export default function BeforeAfter({
  beforeImage,
  afterImage,
  metrics,
}: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSliderPosition = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextPosition = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, nextPosition)));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSliderPosition(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderPosition(event.clientX);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleDownload = () => {
    const anchor = document.createElement('a');
    anchor.href = afterImage;
    anchor.download = `clar1ty-upscaled.${getDownloadExtension(afterImage)}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const MetricBar = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[#8b8278]">{label}</span>
        <span className="text-xs font-semibold text-[#e8e4dd]">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#3a3530]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-[#d4a574]"
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="w-full rounded-lg border border-[#3a3530] bg-[#1f1a16] p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#e8e4dd]">Result</h2>
          <p className="mt-1 text-xs text-[#8b8278]">
            Original and enhanced output at the same display scale.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d4a574] px-4 py-2 text-sm font-semibold text-[#1a1410] transition-opacity hover:opacity-90"
        >
          <Download size={16} />
          Download upscaled
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <figure className="overflow-hidden rounded-lg border border-[#3a3530] bg-[#2d2620]">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={beforeImage}
              alt="Original image"
              className="h-full w-full object-contain"
              draggable={false}
            />
          </div>
          <figcaption className="border-t border-[#3a3530] px-4 py-3 text-xs font-medium text-[#8b8278]">
            Original
          </figcaption>
        </figure>

        <figure className="overflow-hidden rounded-lg border border-[#d4a574]/40 bg-[#2d2620]">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={afterImage}
              alt="Enhanced image"
              className="h-full w-full object-contain"
              draggable={false}
            />
          </div>
          <figcaption className="border-t border-[#3a3530] px-4 py-3 text-xs font-medium text-[#d4a574]">
            Enhanced
          </figcaption>
        </figure>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e8e4dd]">Interactive comparison</h3>
        <span className="text-xs text-[#8b8278]">Drag the divider</span>
      </div>

      <div
        ref={containerRef}
        role="slider"
        aria-label="Before and after image comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPosition)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={() => setIsDragging(false)}
        className={`relative mb-6 w-full touch-none select-none overflow-hidden rounded-lg bg-[#2d2620] ${
          isDragging ? 'cursor-grabbing' : 'cursor-col-resize'
        }`}
        style={{ aspectRatio: '16/9' }}
      >
        <img
          src={beforeImage}
          alt="Original comparison layer"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={afterImage}
            alt="Enhanced comparison layer"
            className="absolute inset-y-0 left-0 h-full max-w-none object-contain"
            style={{ width: containerRef.current?.clientWidth ?? '100%' }}
            draggable={false}
          />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-[#d4a574]"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4a574] shadow-lg">
              <svg
                className="h-5 w-5 text-[#1a1410]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 4l-6 8 6 8M15 4l6 8-6 8" />
              </svg>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 top-4 rounded bg-[#1a1410]/80 px-3 py-1 text-xs font-medium text-[#e8e4dd]">
          Before
        </div>
        <div className="pointer-events-none absolute right-4 top-4 rounded bg-[#1a1410]/80 px-3 py-1 text-xs font-medium text-[#e8e4dd]">
          After
        </div>
      </div>

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
