'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import BeforeAfter from '@/components/before-after';
import EnhancementPanel from '@/components/enhancement-panel';
import ImageAnalysisPanel from '@/components/image-analysis';
import UploadZone from '@/components/upload-zone';
import type { EnhancementStrategy, ImageAnalysis } from '@/lib/n3uralia/engine';
import { getPreset } from '@/lib/n3uralia/presets';
import { selectStrategy } from '@/lib/n3uralia/strategy';

type StudioState = 'idle' | 'analyzing' | 'ready' | 'enhancing' | 'done' | 'error';

type DisplayMetrics = {
  fidelity: number;
  detail: number;
  preservation: number;
};

async function readApiError(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as {
        error?: string;
        details?: string;
      };
      return payload.details || payload.error || fallback;
    } catch {
      return fallback;
    }
  }

  const text = await response.text();
  if (!text) return `${fallback} (HTTP ${response.status})`;

  const looksLikeHtml = /<!doctype html|<html/i.test(text);
  return looksLikeHtml
    ? `${fallback} (server returned HTTP ${response.status})`
    : text.slice(0, 300);
}

function readRequiredMetric(headers: Headers, name: string): number {
  const rawValue = headers.get(name);
  if (rawValue === null) {
    throw new Error(`Enhancement response is missing ${name}`);
  }

  const percentage = Number(rawValue);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new Error(`Enhancement response contains invalid ${name}`);
  }

  return percentage / 100;
}

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [strategy, setStrategy] = useState<EnhancementStrategy | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [studioState, setStudioState] = useState<StudioState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DisplayMetrics | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setAfterImage(null);
    setMetrics(null);
    setErrorMessage(null);
    setStudioState('analyzing');

    const reader = new FileReader();
    reader.onload = (event) => setBeforeImage(event.target?.result as string);
    reader.readAsDataURL(selectedFile);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Analysis failed'));
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Analysis response was not successful');
      }

      setAnalysis(data.analysis);
      setStrategy(selectStrategy(data.analysis));
      setStudioState('ready');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Analysis failed');
      setStudioState('error');
    }
  }, []);

  const handleScaleChange = useCallback(
    (scale: number) => {
      if (!strategy || !analysis) return;

      setStrategy(
        selectStrategy(analysis, {
          scaleFactor: scale,
          qualityTarget: strategy.qualityTarget,
          presetId: strategy.presetId,
        }),
      );
    },
    [strategy, analysis],
  );

  const handlePresetChange = useCallback(
    (presetId: string) => {
      if (!strategy || !analysis) return;

      const preset = getPreset(presetId);
      const updatedStrategy = selectStrategy(analysis, {
        scaleFactor: strategy.scaleFactor,
        qualityTarget: strategy.qualityTarget,
        presetId,
      });

      setStrategy({
        ...updatedStrategy,
        presetId,
        creativity: preset.creativity,
        resemblance: preset.resemblance,
        denoise_steps: preset.denoise_steps,
        sharpen: preset.sharpen,
        dynamic: preset.dynamic,
        tile_overlap: preset.tile_overlap,
      });
    },
    [strategy, analysis],
  );

  const handleEnhance = useCallback(async () => {
    if (!file || !strategy) return;

    setStudioState('enhancing');
    setErrorMessage(null);
    setMetrics(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('strategy', JSON.stringify(strategy));

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Enhancement failed'));
      }

      const measuredMetrics: DisplayMetrics = {
        fidelity: readRequiredMetric(response.headers, 'X-Fidelity'),
        detail: readRequiredMetric(response.headers, 'X-Detail'),
        preservation: readRequiredMetric(response.headers, 'X-Preservation'),
      };

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (event) => {
        setAfterImage(event.target?.result as string);
        setMetrics(measuredMetrics);
        setStudioState('done');
      };
      reader.onerror = () => {
        setErrorMessage('Unable to read enhanced image result');
        setStudioState('error');
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Enhancement failed');
      setStudioState('error');
    }
  }, [file, strategy]);

  const handleReset = useCallback(() => {
    setFile(null);
    setAnalysis(null);
    setStrategy(null);
    setBeforeImage(null);
    setAfterImage(null);
    setMetrics(null);
    setErrorMessage(null);
    setStudioState('idle');
  }, []);

  const isAnalyzing = studioState === 'analyzing';
  const isEnhancing = studioState === 'enhancing';

  return (
    <div className="text-[#e8e4dd]">
      <div className="sticky top-[57px] z-40 border-b border-[#3a3530] bg-[#1f1a16]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold text-[#e8e4dd]">Studio</h1>
            <p className="mt-0.5 text-xs text-[#8b8278]">N3uralia image enhancement engine</p>
          </div>
          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-[#3a3530] px-4 py-2 text-sm text-[#8b8278] transition-colors hover:border-[#d4a574]/50 hover:text-[#e8e4dd]"
            >
              <RotateCcw size={14} />
              New Image
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <AnimatePresence mode="wait">
          {studioState === 'idle' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl"
            >
              <div className="mb-10 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d2620]">
                  <Sparkles size={22} className="text-[#d4a574]" strokeWidth={1.5} />
                </div>
                <h2 className="mb-2 text-2xl font-semibold">Upload an image</h2>
                <p className="text-sm leading-relaxed text-[#8b8278]">
                  PNG, JPEG, or WebP up to 50 MB. The engine will analyze measurable image signals and recommend a processing preset.
                </p>
              </div>
              <UploadZone onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              <div className="space-y-4 lg:col-span-1">
                {analysis ? (
                  <ImageAnalysisPanel analysis={analysis} />
                ) : (
                  <div className="rounded-lg border border-[#3a3530] bg-[#1f1a16] p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[#d4a574]" />
                      <h2 className="text-sm font-semibold text-[#e8e4dd]">Image Analysis</h2>
                    </div>
                    <div className="space-y-3">
                      {[80, 60, 70, 50].map((width, index) => (
                        <div
                          key={index}
                          className="h-3 animate-pulse rounded bg-[#2d2620]"
                          style={{ width: `${width}%` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {strategy ? (
                  <EnhancementPanel
                    strategy={strategy}
                    onScaleChange={handleScaleChange}
                    onPresetChange={handlePresetChange}
                    onEnhance={handleEnhance}
                    isProcessing={isEnhancing}
                    detectedContent={analysis?.detectedContent}
                    recommendedPresetId={analysis?.recommendedPresetId}
                    recommendedPresetReason={analysis?.recommendedPresetReason}
                  />
                ) : (
                  <div className="rounded-lg border border-[#3a3530] bg-[#1f1a16] p-6">
                    <div className="space-y-3">
                      {[90, 65, 75].map((width, index) => (
                        <div
                          key={index}
                          className="h-3 animate-pulse rounded bg-[#2d2620]"
                          style={{ width: `${width}%` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {studioState === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-[#ff6b6b]/30 bg-[#1f1a16] p-4"
                  >
                    <p className="mb-1 text-sm font-medium text-[#ff6b6b]">Error</p>
                    <p className="text-xs text-[#8b8278]">{errorMessage}</p>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2">
                {beforeImage && studioState === 'done' && afterImage && metrics ? (
                  <BeforeAfter
                    beforeImage={beforeImage}
                    afterImage={afterImage}
                    metrics={metrics}
                  />
                ) : beforeImage ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-lg border border-[#3a3530] bg-[#1f1a16]"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <div className="relative h-full w-full">
                      <img src={beforeImage} alt="Image preview" className="h-full w-full object-cover" />
                      {(isAnalyzing || isEnhancing) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1410]/60 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#d4a574] border-t-transparent" />
                            <p className="text-sm font-medium text-[#e8e4dd]">
                              {isAnalyzing ? 'Analyzing image…' : 'Enhancing image…'}
                            </p>
                            <p className="mt-1 text-xs text-[#8b8278]">
                              {isEnhancing
                                ? `${strategy?.scaleFactor}x upscale · ${strategy?.model}`
                                : 'Measuring image signals'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
