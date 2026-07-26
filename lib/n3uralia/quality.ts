import sharp from 'sharp';

const SAMPLE_SIZE = 256;
const EPSILON = 1e-8;

export interface EnhancementMetrics {
  /** Global structural similarity between source and enhanced output, 0..1. */
  fidelity: number;
  /** Detail score derived from measured edge-energy change, 0..1. */
  detail: number;
  /** Combined structural and tonal preservation score, 0..1. */
  preservation: number;
  /** Relative edge-energy change. 0 means unchanged; 0.2 means +20%. */
  detailGain: number;
  /** Alias of measured edge-energy change for UI/reporting clarity. */
  sharpnessChange: number;
  /** Histogram similarity between source and enhanced output, 0..1. */
  tonePreservation: number;
  /** Documents the deterministic evaluator used to produce the values. */
  method: 'n3uralia-local-v1';
}

interface Sample {
  pixels: Uint8Array;
  width: number;
  height: number;
}

/**
 * Evaluate an enhanced image against its source using deterministic local
 * measurements. The enhanced image is reduced to the same sample dimensions,
 * so scale alone cannot inflate the result.
 */
export async function evaluateEnhancement(
  originalBuffer: Buffer,
  enhancedBuffer: Buffer,
): Promise<EnhancementMetrics> {
  if (!originalBuffer?.length || !enhancedBuffer?.length) {
    throw new Error('Both original and enhanced image buffers are required');
  }

  const [original, enhanced] = await Promise.all([
    sampleImage(originalBuffer),
    sampleImage(enhancedBuffer),
  ]);

  const width = Math.min(original.width, enhanced.width);
  const height = Math.min(original.height, enhanced.height);
  const count = width * height;

  if (!count) {
    throw new Error('Unable to evaluate empty image samples');
  }

  const source = original.pixels.subarray(0, count);
  const output = enhanced.pixels.subarray(0, count);

  const fidelity = structuralSimilarity(source, output);
  const sourceEdges = edgeEnergy(source, width, height);
  const outputEdges = edgeEnergy(output, width, height);
  const detailRatio = outputEdges / Math.max(sourceEdges, EPSILON);
  const detailGain = clamp(detailRatio - 1, -1, 3);
  const detail = detailScore(detailRatio);
  const tonePreservation = histogramSimilarity(source, output);
  const preservation = clamp01(fidelity * 0.7 + tonePreservation * 0.3);

  return {
    fidelity: round(fidelity, 4),
    detail: round(detail, 4),
    preservation: round(preservation, 4),
    detailGain: round(detailGain, 4),
    sharpnessChange: round(detailGain, 4),
    tonePreservation: round(tonePreservation, 4),
    method: 'n3uralia-local-v1',
  };
}

async function sampleImage(buffer: Buffer): Promise<Sample> {
  const { data, info } = await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(SAMPLE_SIZE, SAMPLE_SIZE, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
    })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    pixels: new Uint8Array(data),
    width: info.width,
    height: info.height,
  };
}

/** Global SSIM-style comparison using luminance, contrast and covariance. */
function structuralSimilarity(a: Uint8Array, b: Uint8Array): number {
  const count = Math.min(a.length, b.length);
  let sumA = 0;
  let sumB = 0;

  for (let i = 0; i < count; i += 1) {
    sumA += a[i];
    sumB += b[i];
  }

  const meanA = sumA / count;
  const meanB = sumB / count;
  let varianceA = 0;
  let varianceB = 0;
  let covariance = 0;

  for (let i = 0; i < count; i += 1) {
    const deltaA = a[i] - meanA;
    const deltaB = b[i] - meanB;
    varianceA += deltaA * deltaA;
    varianceB += deltaB * deltaB;
    covariance += deltaA * deltaB;
  }

  const denominator = Math.max(1, count - 1);
  varianceA /= denominator;
  varianceB /= denominator;
  covariance /= denominator;

  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  const numerator =
    (2 * meanA * meanB + c1) * (2 * covariance + c2);
  const divisor =
    (meanA * meanA + meanB * meanB + c1) *
    (varianceA + varianceB + c2);

  return clamp01(divisor > EPSILON ? numerator / divisor : 1);
}

function edgeEnergy(
  pixels: Uint8Array,
  width: number,
  height: number,
): number {
  if (width < 2 || height < 2) return 0;

  let energy = 0;
  let comparisons = 0;

  for (let y = 1; y < height; y += 1) {
    for (let x = 1; x < width; x += 1) {
      const index = y * width + x;
      const horizontal = pixels[index] - pixels[index - 1];
      const vertical = pixels[index] - pixels[index - width];
      energy += Math.sqrt(horizontal * horizontal + vertical * vertical);
      comparisons += 1;
    }
  }

  return comparisons ? energy / comparisons : 0;
}

/**
 * Scores measured edge change. A modest 5-25% increase is treated as useful;
 * unchanged detail remains credible, while excessive sharpening is penalized.
 */
function detailScore(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  const targetRatio = 1.12;
  return clamp01(Math.exp(-Math.abs(Math.log(ratio / targetRatio)) * 1.6));
}

function histogramSimilarity(a: Uint8Array, b: Uint8Array): number {
  const histogramA = new Uint32Array(256);
  const histogramB = new Uint32Array(256);
  const count = Math.min(a.length, b.length);

  for (let i = 0; i < count; i += 1) {
    histogramA[a[i]] += 1;
    histogramB[b[i]] += 1;
  }

  let distance = 0;
  for (let value = 0; value < 256; value += 1) {
    distance += Math.abs(histogramA[value] - histogramB[value]);
  }

  return clamp01(1 - distance / Math.max(1, 2 * count));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
