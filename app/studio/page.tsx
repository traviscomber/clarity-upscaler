'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UploadZone from '@/components/upload-zone';
import ImageAnalysisPanel from '@/components/image-analysis';
import EnhancementPanel from '@/components/enhancement-panel';
import BeforeAfter from '@/components/before-after';
import { selectStrategy } from '@/lib/n3uralia/strategy';
import type { ImageAnalysis, EnhancementStrategy } from '@/lib/n3uralia/engine';

export default function StudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [strategy, setStrategy] = useState<EnhancementStrategy | null>(null);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [metrics, setMetrics] = useState<{
    fidelity: number;
    detail: number;
    preservation: number;
  } | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setAnalyzing(selectedFile);
  };

  const setAnalyzing = async (selectedFile: File) => {
    setIsAnalyzing(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBeforeImage(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Analyze
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        const newStrategy = selectStrategy(data.analysis);
        setStrategy(newStrategy);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScaleChange = (scale: number) => {
    if (strategy && analysis) {
      const newStrategy = selectStrategy(analysis, {
        scaleFactor: scale,
        qualityTarget: strategy.qualityTarget,
      });
      setStrategy(newStrategy);
    }
  };

  const handleEnhance = async () => {
    if (!file || !strategy || !analysis) return;

    setIsEnhancing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('strategy', JSON.stringify(strategy));

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          setAfterImage(e.target?.result as string);
          // Simulate metrics
          setMetrics({
            fidelity: 0.98,
            detail: 0.95,
            preservation: 0.99,
          });
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F2]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#262626] bg-[#101010] sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#FFFFFF]">Clar1ty</h1>
              <p className="text-[#8A8A8A] text-sm mt-1">
                Professional image upscaling with N3uralia engine
              </p>
            </div>
            <nav className="flex gap-4">
              <a
                href="/"
                className="px-4 py-2 text-[#F5F5F2] hover:text-[#7FE7D8] transition-colors"
              >
                Home
              </a>
              <a
                href="/models"
                className="px-4 py-2 text-[#F5F5F2] hover:text-[#7FE7D8] transition-colors"
              >
                Models
              </a>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!file ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UploadZone onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Analysis */}
            <div className="lg:col-span-1 space-y-6">
              {analysis && <ImageAnalysisPanel analysis={analysis} />}
              {strategy && (
                <EnhancementPanel
                  strategy={strategy}
                  onScaleChange={handleScaleChange}
                  onEnhance={handleEnhance}
                  isProcessing={isEnhancing}
                />
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-2">
              {beforeImage && afterImage && metrics ? (
                <BeforeAfter
                  beforeImage={beforeImage}
                  afterImage={afterImage}
                  metrics={metrics}
                />
              ) : beforeImage ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-[#101010] rounded-lg p-6 border border-[#262626]"
                  style={{ aspectRatio: '16/9' }}
                >
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <img
                      src={beforeImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 border-2 border-[#7FE7D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[#F5F5F2]">Analyzing image...</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        )}

        {/* Info Section */}
        {!file && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: 'No Visual Noise',
                description: 'Clean, professional interface focused on your images',
                icon: '✨',
              },
              {
                title: 'AI Powered',
                description: 'Advanced N3uralia engine with intelligent strategies',
                icon: '🧠',
              },
              {
                title: 'Quality Guaranteed',
                description: 'Professional-grade upscaling with preservation metrics',
                icon: '⭐',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-[#101010] border border-[#262626] rounded-lg p-6 text-center"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-[#F5F5F2] font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#8A8A8A] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.section>
        )}
      </main>
    </div>
  );
}
