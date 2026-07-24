const sharp = require('sharp');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, '../public/deteriorated-test.png');
  const outputPath = path.join(__dirname, '../public/processed-result.png');

  console.log('[Processing] Starting balanced restoration pipeline...');

  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`[Processing] Original: ${metadata.width}×${metadata.height}px`);

    const processed = sharp(inputPath)
      // Progressive upscaling
      .resize(metadata.width * 2, metadata.height * 2, { kernel: sharp.kernel.lanczos3 })
      .median(2)
      .resize(metadata.width * 4, metadata.height * 4, { kernel: sharp.kernel.lanczos3 })
      .normalise()
      // Balanced color restoration
      .modulate({
        saturation: 2.0,
        brightness: 1.28,
        hue: 8,
      })
      // Strong sharpening
      .sharpen({ sigma: 3.5, m1: 0.9, m2: 1.3 })
      // Strong contrast
      .linear(1.4, 10)
      .png({ quality: 95, compression: 9, adaptiveFiltering: true });

    await processed.toFile(outputPath);

    const fs = require('fs');
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;

    console.log(`[Processing] ✓ Complete: ${outputPath}`);
    console.log(`[Processing] Size: ${(outputSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`[Processing] Applied: 4x upscale + balanced color (2.0x sat, 1.28x bright, +8 hue) + strong sharpen (3.5) + contrast (1.4x + 10)`);

  } catch (error) {
    console.error('[Processing] Error:', error.message);
    process.exit(1);
  }
}

processImage();
