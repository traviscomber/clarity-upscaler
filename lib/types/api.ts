/**
 * API Response Types
 * Centralized types for all API endpoints
 */

import type { ImageAnalysis, EnhancementStrategy, EnhancementResult } from '../n3uralia/engine';

export type QualityMetrics = EnhancementResult['metrics'];

/**
 * Analyze Endpoint Response
 */
export interface AnalyzeResponse {
  success: boolean;
  analysis: ImageAnalysis;
  metadata: {
    fileSize: number;
    fileName: string;
    analysisTime: number;
  };
}

/**
 * Enhance Endpoint Response (direct)
 */
export interface EnhanceImageResponse {
  success: boolean;
  jobId: string;
  status: 'completed' | 'processing';
  metrics: QualityMetrics;
  metadata: {
    originalSize: number;
    enhancedSize: number;
    processingTime: number;
    scaleFactor: number;
    model: string;
  };
}

/**
 * Job Status Response
 */
export interface JobStatusResponse {
  success: boolean;
  job: {
    jobId: string;
    status: 'queued' | 'analyzing' | 'processing' | 'completed' | 'error';
    progress: number;
    createdAt: string;
    completedAt?: string;
    inputFile: {
      name: string;
      size: number;
    };
    enhancement?: {
      strategy: EnhancementStrategy;
      scaleFactor: number;
      model: string;
    };
    result?: {
      outputSize: number;
      processingTime: number;
      metrics: QualityMetrics;
      downloadUrl: string;
    };
    error?: string;
  };
}

/**
 * List Jobs Response
 */
export interface ListJobsResponse {
  success: boolean;
  jobs: JobStatusResponse['job'][];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  code?: string;
  statusCode: number;
}

/**
 * Generic API Success Response
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Check if response is error
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response?.success === false;
}

/**
 * Check if response is success
 */
export function isSuccessResponse<T>(
  response: any
): response is SuccessResponse<T> {
  return response?.success === true;
}
