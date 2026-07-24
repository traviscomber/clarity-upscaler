'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import UploadZone from '@/components/upload-zone';
import ImageAnalysisPanel from '@/components/image-analysis';
import EnhancementPanel from '@/components/enhancement-panel';
import BeforeAfter from '@/components/before-after';
import { selectStrategy } from '@/lib/n3uralia/strategy';
import type { ImageAnalysis, EnhancementStrategy } from '@/lib/n3uralia/engine';

type StudioState = 'idle' | 'analyzing' | 'ready' | 'enhancing' | 'done' | 'error';

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [strategy, setStrategy] = useState<EnhancementStrategy | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [studioState, setStudioState] = useState<StudioState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    fidelity: number;
    detail: number;
    preservation: number;
  } | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setAfterImage(null);
    setMetrics(null);
    setErrorMessage(null);
    setStudioState('analyzing');

    // Build preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setBeforeImage(e.target?.result as string);
    reader.readAsDataURL(selectedFile);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? 'Analysis failed');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setStrategy(selectStrategy(data.analysis));
        setStudioState('ready');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setErrorMessage(msg);
      setStudioState('error');
    }
  }, []);

  const handleScaleChange = useCallback(
    (scale: number) => {
      if (strategy && analysis) {
        setStrategy(
          selectStrategy(analysis, {
            scaleFactor: scale,
            qualityTarget: strategy.qualityTarget,
          })
        );
      }
    },
    [strategy, analysis]
  );

  const handleEnhance = useCallback(async () => {
    if (!file || !strategy) return;
    setStudioState('enhancing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('strategy', JSON.stringify(strategy));

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? 'Enhancement failed');
      }

      // Read quality metrics from response headers
      const fidelity = Number(response.headers.get('X-Fidelity') ?? 98) / 100;
      const detail = Number(response.headers.get('X-Detail') ?? 95) / 100;
      const preservation = Number(response.headers.get('X-Preservation') ?? 99) / 100;

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        setAfterImage(e.target?.result as string);
        setMetrics({ fidelity, detail, preservation });
        setStudioState('done');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Enhancement failed';
      setErrorMessage(msg);
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
      {/* Page header */}
      <div className="border-b border-[#3a3530] bg-[#1f1a16] sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#e8e4dd]">Studio</h1>
            <p className="text-[#8b8278] text-xs mt-0.5">N3uralia image enhancement engine</p>
          </div>
          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3a3530] text-[#8b8278] hover:text-[#e8e4dd] hover:border-[#d4a574]/50 transition-colors text-sm"
            >
              <RotateCcw size={14} />
              New Image
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {studioState === 'idle' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2d2620] mb-4">
                  <Sparkles size={22} className="text-[#d4a574]" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Upload an image</h2>
                <p className="text-[#8b8278] text-sm leading-relaxed">
                  PNG, JPEG, or WebP up to 50 MB. The engine will analyze content and recommend the optimal model.
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left column */}
              <div className="lg:col-span-1 space-y-4">
                {/* Analysis panel */}
                {analysis ? (
                  <ImageAnalysisPanel analysis={analysis} />
                ) : (
                  <div className="bg-[#1f1a16] border border-[#3a3530] rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-[#d4a574] animate-pulse" />
                      <h2 className="text-[#e8e4dd] font-semibold text-sm">AI Analysis</h2>
                    </div>
                    <div className="space-y-3">
                      {[80, 60, 70, 50].map((w, i) => (
                        <div key={i} className="h-3 rounded bg-[#2d2620] animate-pulse" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhancement panel */}
                {strategy ? (
                  <EnhancementPanel
                    strategy={strategy}
                    onScaleChange={handleScaleChange}
                    onEnhance={handleEnhance}
                    isProcessing={isEnhancing}
                  />
                ) : (
                  <div className="bg-[#1f1a16] border border-[#3a3530] rounded-lg p-6">
                    <div className="space-y-3">
                      {[90, 65, 75].map((w, i) => (
                        <div key={i} className="h-3 rounded bg-[#2d2620] animate-pulse" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Error state */}
                {studioState === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1f1a16] border border-[#ff6b6b]/30 rounded-lg p-4"
                  >
                    <p className="text-[#ff6b6b] text-sm font-medium mb-1">Error</p>
                    <p className="text-[#8b8278] text-xs">{errorMessage}</p>
                  </motion.div>
                )}
              </div>

              {/* Right column — preview */}
              <div className="lg:col-span-2">
                {beforeImage && (studioState === 'done' && afterImage && metrics) ? (
                  <BeforeAfter
                    beforeImage={beforeImage}
                    afterImage={afterImage}
                    metrics={metrics}
                  />
                ) : beforeImage ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1f1a16] border border-[#3a3530] rounded-lg overflow-hidden"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={beforeImage}
                        alt="Image preview"
                        className="w-full h-full object-cover"
                      />
                      {(isAnalyzing || isEnhancing) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1410]/60 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="w-10 h-10 border-2 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-[#e8e4dd] text-sm font-medium">
                              {isAnalyzing ? 'Analyzing image…' : 'Enhancing image…'}
                            </p>
                            <p className="text-[#8b8278] text-xs mt-1">
                              {isEnhancing ? `${strategy?.scaleFactor}x upscale · ${strategy?.model}` : 'Detecting content and model'}
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
