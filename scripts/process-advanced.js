const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, '../public/deteriorated-test.png');
  const outputPath = path.join(__dirname, '../public/processed-result.png');

  console.log('[Advanced Pipeline] Starting restoration...');

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`[Advanced Pipeline] Original: ${metadata.width}×${metadata.height}px`);

    const processed = await image
      .median(2)
      .blur(1.2)
      .resize(Math.round(metadata.width * 2), Math.round(metadata.height * 2), { kernel: 'lanczos3' })
      .resize(Math.round(metadata.width * 4), Math.round(metadata.height * 4), { kernel: 'lanczos3' })
      .modulate({
        brightness: 1.15,
        saturation: 1.35
      })
      .linear(1.2, 5)
      .sharpen({ sigma: 2.8 })
      .sharpen({ sigma: 1.5 })
      .gamma(1.05)
      .toBuffer();

    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    await fs.promises.writeFile(outputPath, processed);
    const newStats = fs.statSync(outputPath);

    console.log(`[Advanced Pipeline] Output: ${outputPath}`);
    console.log(`[Advanced Pipeline] Size: ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`[Advanced Pipeline] ✓ Complete - Optimized parameters (no normalize, reduced saturation)`);

  } catch (err) {
    console.error('[Advanced Pipeline] Error:', err.message);
    process.exit(1);
  }
}

processImage();
