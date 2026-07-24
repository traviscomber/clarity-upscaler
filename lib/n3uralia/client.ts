/**
 * N3uralia Client SDK
 * Unified interface for frontend to interact with upscaling engine
 */

import type { ImageAnalysis, EnhancementStrategy } from './engine';

export interface AnalyzeResponse {
  success: boolean;
  analysis: ImageAnalysis;
  metadata: {
    fileSize: number;
    fileName: string;
    analysisTime: number;
  };
}

export interface EnhanceResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress?: number;
  metrics?: {
    fidelity: number;
    detail: number;
    preservation: number;
  };
  resultUrl?: string;
  error?: string;
}

export interface JobStatus {
  jobId: string;
  status: 'queued' | 'analyzing' | 'processing' | 'completed' | 'error';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

/**
 * Analyze image and detect content
 */
export async function analyzeImage(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Enhance image with upscaling
 */
export async function enhanceImage(
  file: File,
  strategy: EnhancementStrategy
): Promise<EnhanceResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('strategy', JSON.stringify(strategy));

  const response = await fetch('/api/enhance', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Enhancement failed');
  }

  // Check if response is blob (image) or JSON (job info)
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('image')) {
    // Direct enhancement result
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Extract metrics from headers
    const fidelity =
      Number(response.headers.get('X-Fidelity')) / 100 || 0.85;
    const detail = Number(response.headers.get('X-Detail')) / 100 || 0.90;
    const preservation =
      Number(response.headers.get('X-Preservation')) / 100 || 0.88;

    return {
      jobId: response.headers.get('X-Job-Id') || 'direct',
      status: 'completed',
      progress: 100,
      resultUrl: url,
      metrics: {
        fidelity,
        detail,
        preservation,
      },
    };
  } else {
    // Job queued
    const data = await response.json();
    return data;
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`/api/jobs?jobId=${jobId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch job status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Poll job until completion
 */
export async function pollJobStatus(
  jobId: string,
  callback?: (status: JobStatus) => void,
  maxAttempts = 120,
  interval = 1000
): Promise<JobStatus> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await getJobStatus(jobId);

    if (callback) {
      callback(status);
    }

    if (status.status === 'completed' || status.status === 'error') {
      return status;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error('Job polling timeout');
}

/**
 * Download enhanced image
 */
export async function downloadEnhancedImage(
  url: string,
  filename: string
): Promise<void> {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'enhanced-image.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Cancel enhancement job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const response = await fetch(`/api/jobs?jobId=${jobId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel job: ${response.statusText}`);
  }
}
