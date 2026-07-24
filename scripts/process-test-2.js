const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, '../public/test-photo-2.png');
  const outputPath = path.join(__dirname, '../public/processed-test-2.png');

  console.log('[Test 2] Processing landscape photo...');

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`[Test 2] Original: ${metadata.width}×${metadata.height}px`);

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

    console.log(`[Test 2] Output: ${outputPath}`);
    console.log(`[Test 2] Size: ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`[Test 2] ✓ Complete`);

  } catch (err) {
    console.error('[Test 2] Error:', err.message);
    process.exit(1);
  }
}

processImage();
