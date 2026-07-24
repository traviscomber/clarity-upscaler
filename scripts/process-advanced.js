const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, '../public/deteriorated-test.png');
  const outputPath = path.join(__dirname, '../public/processed-result.png');

  console.log('[Advanced Pipeline] Starting restoration...');
  console.log('[Advanced Pipeline] Input:', inputPath);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`[Advanced Pipeline] Original: ${metadata.width}×${metadata.height}px`);

    const processed = await image
      // Stage 1: Bilateral-like filtering with median + blur combination
      .median(2)
      .blur(1.2)
      
      // Stage 2: Progressive upscaling (2x then 4x)
      .resize(Math.round(metadata.width * 2), Math.round(metadata.height * 2), {
        kernel: 'lanczos3'
      })
      .resize(Math.round(metadata.width * 4), Math.round(metadata.height * 4), {
        kernel: 'lanczos3'
      })
      
      // Stage 3: Advanced color correction
      .modulate({
        brightness: 1.18,    // More brightness for clarity
        saturation: 1.9,     // Higher saturation
        hue: 8               // Reduce sepia tint further
      })
      
      // Stage 4: Normalize and boost contrast more aggressively
      .normalize()
      .linear(1.25, 8)      // Linear contrast boost
      
      // Stage 5: Multiple sharpening passes
      .sharpen({ sigma: 2.8 })
      .sharpen({ sigma: 1.5 })
      
      // Stage 6: Final enhancement
      .gamma(1.05)
      .toBuffer();

    const stats = fs.statSync(outputPath, { bigint: false });
    
    // Remove old file
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    // Write new processed image
    await fs.promises.writeFile(outputPath, processed);
    const newStats = fs.statSync(outputPath);

    console.log(`[Advanced Pipeline] Output: ${outputPath}`);
    console.log(`[Advanced Pipeline] Processed size: ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`[Advanced Pipeline] ✓ Restoration complete`);
    console.log('[Advanced Pipeline] Applied:');
    console.log('  • Bilateral-like smoothing (median + blur)');
    console.log('  • 4x progressive upscaling (Lanczos3)');
    console.log('  • Color correction (brightness 1.18x, saturation 1.9x, hue +8)');
    console.log('  • Normalization + advanced contrast (1.25x + 8)');
    console.log('  • Double sharpening (2.8 + 1.5 sigma)');
    console.log('  • Gamma correction (1.05)');

  } catch (err) {
    console.error('[Advanced Pipeline] Error:', err.message);
    process.exit(1);
  }
}

processImage();
