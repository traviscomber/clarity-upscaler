const sharp = require('sharp');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, '../public/deteriorated-test.png');
  const outputPath = path.join(__dirname, '../public/processed-result.png');

  console.log('[Processing] Starting enhanced restoration pipeline...');
  console.log(`[Processing] Input: ${inputPath}`);
  console.log(`[Processing] Output: ${outputPath}`);

  try {
    // Step 1: Read and get metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`[Processing] Original size: ${metadata.width}×${metadata.height}px`);

    // Step 2: Progressive restoration pipeline
    const processed = sharp(inputPath)
      // 1. Initial upscale to 2x (better quality than direct 4x)
      .resize(metadata.width * 2, metadata.height * 2, {
        kernel: sharp.kernel.lanczos3,
      })
      // 2. Median blur for noise reduction (preserves edges)
      .median(2)
      // 3. Second upscale to 4x final
      .resize(metadata.width * 4, metadata.height * 4, {
        kernel: sharp.kernel.lanczos3,
      })
      // 4. Normalize and enhance contrast
      .normalise()
      // 5. Increase saturation for color restoration (1.8x)
      .modulate({
        saturation: 1.8,
        brightness: 1.15,
        hue: 5, // Slight warm shift to correct sepia
      })
      // 6. Enhance details with unsharp mask
      .sharpen({
        sigma: 3.0,
        m1: 0.5,
        m2: 1.0,
      })
      // 7. Final contrast boost
      .linear(1.2, 5)
      // 8. Convert to PNG with compression
      .png({ 
        quality: 95,
        compression: 9,
        adaptiveFiltering: true,
      });

    // Write output
    await processed.toFile(outputPath);

    // Get output metadata
    const outputMetadata = await sharp(outputPath).metadata();
    const fs = require('fs');
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;

    console.log(`\n[Processing] ✓ Restoration complete!`);
    console.log(`[Processing] Processed size: ${outputMetadata.width}×${outputMetadata.height}px`);
    console.log(`[Processing] Input: ${(inputSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`[Processing] Output: ${(outputSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`\n[Processing] Pipeline applied:`);
    console.log(`  ✓ 2x upscale (Lanczos3)`);
    console.log(`  ✓ Median blur (noise reduction)`);
    console.log(`  ✓ 4x upscale final`);
    console.log(`  ✓ Normalization + contrast boost`);
    console.log(`  ✓ Saturation: 1.8x | Brightness: 1.15x | Hue: +5`);
    console.log(`  ✓ Unsharp mask (sigma: 3.0)`);
    console.log(`  ✓ Linear contrast (1.2x + 5)`);
    console.log(`\n[Processing] Ready for display in results page`);

  } catch (error) {
    console.error('[Processing] Error:', error.message);
    process.exit(1);
  }
}

processImage();
