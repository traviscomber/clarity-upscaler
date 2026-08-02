/**
 * Hugging Face Model Loader
 * Utility for downloading and managing ONNX models from Hugging Face Hub
 */

export interface HuggingFaceModelConfig {
  repo: string;
  filename: string;
  revision?: string;
}

/**
 * Parse a Hugging Face model URL or repo identifier
 * Supports formats:
 * - https://huggingface.co/owner/repo/resolve/main/model.onnx
 * - owner/repo
 * - https://huggingface.co/owner/repo
 */
export function parseHuggingFaceModel(input: string): HuggingFaceModelConfig | null {
  try {
    // Parse full URL
    if (input.startsWith('http')) {
      const url = new URL(input);
      if (!url.hostname.includes('huggingface.co')) return null;
      
      const parts = url.pathname.split('/').filter(p => p);
      if (parts.length < 2) return null;
      
      const owner = parts[0];
      const repo = parts[1];
      const filename = parts.slice(4).join('/') || 'model.onnx';
      const revision = parts[3] === 'resolve' ? parts[2] : undefined;
      
      return { repo: `${owner}/${repo}`, filename, revision };
    }
    
    // Parse repo/model format
    if (input.includes('/')) {
      const [owner, rest] = input.split('/');
      const [repo, ...pathParts] = rest.split('/');
      return {
        repo: `${owner}/${repo}`,
        filename: pathParts.join('/') || 'model.onnx',
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Construct a download URL for a Hugging Face model file
 */
export function constructHuggingFaceUrl(
  config: HuggingFaceModelConfig,
  cdn: boolean = true,
): string {
  const base = cdn
    ? 'https://cdn-lfs.huggingface.co/repos'
    : 'https://huggingface.co';
  
  const [owner, repo] = config.repo.split('/');
  const revision = config.revision || 'main';
  
  if (cdn) {
    return `${base}/${owner}/${repo}/${revision}/${config.filename}`;
  }
  
  return `${base}/${owner}/${repo}/resolve/${revision}/${config.filename}`;
}

/**
 * Verify a Hugging Face model URL is accessible
 */
export async function verifyHuggingFaceModel(url: string): Promise<{
  accessible: boolean;
  status?: number;
  contentLength?: number;
  contentType?: string;
}> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    
    return {
      accessible: response.ok,
      status: response.status,
      contentLength: response.headers.get('content-length')
        ? parseInt(response.headers.get('content-length')!)
        : undefined,
      contentType: response.headers.get('content-type') || undefined,
    };
  } catch (error) {
    return { accessible: false };
  }
}

/**
 * Get model info from Hugging Face Hub API
 */
export async function getHuggingFaceModelInfo(config: HuggingFaceModelConfig): Promise<{
  exists: boolean;
  siblings?: Array<{ filename: string; size?: number }>;
}> {
  try {
    const response = await fetch(
      `https://huggingface.co/api/models/${config.repo}`,
    );
    
    if (!response.ok) {
      return { exists: false };
    }
    
    const data = (await response.json()) as {
      siblings?: Array<{ filename: string; size?: number }>;
    };
    
    return {
      exists: true,
      siblings: data.siblings,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes?: number): string {
  if (!bytes) return 'unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)}${units[unitIndex]}`;
}
