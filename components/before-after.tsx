'use client';

import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  backend?: {
    id: string;
    neural: boolean;
    modelId?: string;
    fallbackReason?: string;
  };
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
  backend,
  metrics,
}: BeforeAfterProps) {
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
            Original and upscaled image shown side by side.
          </p>
          {backend && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full border px-2.5 py-1 font-medium ${
                  backend.neural
                    ? 'border-[#d4a574]/50 bg-[#d4a574]/10 text-[#d4a574]'
                    : 'border-[#3a3530] bg-[#2d2620] text-[#8b8278]'
                }`}
              >
                {backend.neural ? 'Neural ONNX' : 'Classical CPU'}
              </span>
              {backend.modelId && (
                <span className="text-[#8b8278]">{backend.modelId}</span>
              )}
            </div>
          )}
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

      {backend?.fallbackReason && (
        <div className="mb-5 rounded-lg border border-[#d4a574]/20 bg-[#2d2620] px-4 py-3 text-xs text-[#8b8278]">
          Neural fallback: {backend.fallbackReason}
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <figure className="overflow-hidden rounded-lg border border-[#3a3530] bg-[#2d2620]">
          <div className="flex min-h-[320px] items-center justify-center overflow-hidden p-3">
            <img
              src={beforeImage}
              alt="Original image"
              className="max-h-[680px] w-full object-contain"
              draggable={false}
            />
          </div>
          <figcaption className="border-t border-[#3a3530] px-4 py-3 text-xs font-medium text-[#8b8278]">
            Original
          </figcaption>
        </figure>

        <figure className="overflow-hidden rounded-lg border border-[#d4a574]/40 bg-[#2d2620]">
          <div className="flex min-h-[320px] items-center justify-center overflow-hidden p-3">
            <img
              src={afterImage}
              alt="Upscaled image"
              className="max-h-[680px] w-full object-contain"
              draggable={false}
            />
          </div>
          <figcaption className="flex items-center justify-between gap-3 border-t border-[#3a3530] px-4 py-3">
            <span className="text-xs font-medium text-[#d4a574]">Upscaled</span>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-md border border-[#d4a574]/50 px-3 py-1.5 text-xs font-semibold text-[#d4a574] transition-colors hover:bg-[#d4a574]/10"
            >
              <Download size={14} />
              Download
            </button>
          </figcaption>
        </figure>
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
