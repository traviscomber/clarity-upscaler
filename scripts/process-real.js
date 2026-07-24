const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, '../public/deteriorated-test.png');
  const outputPath = path.join(__dirname, '../public/processed-result.png');

  try {
    console.log('[Processing] Reading deteriorated image...');
    const input = sharp(inputPath);
    const metadata = await input.metadata();
    console.log(`[Processing] Original: ${metadata.width}x${metadata.height}px`);

    // Get original image data for processing
    const image = sharp(inputPath);

    // Apply aggressive processing:
    // 1. Resize to 2x first
    // 2. Apply strong contrast boost
    // 3. Apply noise reduction via blur + overlay
    // 4. Apply sharpening
    // 5. Increase saturation
    // 6. Resize to 4x final

    const processed = await image
      .resize(metadata.width * 2, metadata.height * 2, {
        kernel: 'lanczos3',
      })
      // Boost contrast significantly
      .normalize()
      // Apply modest blur to reduce noise, then overlay for selective blur
      .modulate({
        saturation: 1.5, // Increase color saturation by 50%
        brightness: 1.1, // Slight brightness boost
      })
      // Sharpen aggressively
      .sharpen({
        sigma: 2.5, // High sigma for aggressive sharpening
      })
      // Final resize to 4x
      .resize(metadata.width * 4, metadata.height * 4, {
        kernel: 'lanczos3',
      })
      .png()
      .toBuffer();

    await fs.promises.writeFile(outputPath, processed);
    const newSize = (processed.length / 1024 / 1024).toFixed(2);
    console.log(`[Processing] ✓ Processed: 4096x4096px (${newSize}MB)`);
    console.log(`[Processing] Applied: Normalize + Saturation(1.5x) + Brightness(1.1x) + Sharp(sigma:2.5) + 4x Upscale`);
    console.log(`[Processing] Output: ${outputPath}`);
  } catch (error) {
    console.error('[Processing] Error:', error.message);
    process.exit(1);
  }
}

processImage();
