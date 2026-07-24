const fs = require('fs');
const path = require('path');

// Import sharp directly since we're in Node.js
const sharp = require('sharp');

async function processImage() {
  try {
    console.log('[Processing] Reading deteriorated image...');
    const inputPath = path.join(__dirname, '../public/deteriorated-test.png');
    const outputPath = path.join(__dirname, '../public/processed-result.png');

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Read the deteriorated image
    const imageBuffer = fs.readFileSync(inputPath);
    console.log(`[Processing] Image size: ${imageBuffer.length} bytes`);

    // Get metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`[Processing] Original dimensions: ${metadata.width}x${metadata.height}px`);

    // Process with N3uralia-like parameters
    // 4x upscaling with quality focus
    const scaleFactor = 4;
    const targetWidth = Math.round(metadata.width * scaleFactor);
    const targetHeight = Math.round(metadata.height * scaleFactor);

    console.log(`[Processing] Target dimensions: ${targetWidth}x${targetHeight}px`);
    console.log('[Processing] Applying enhancement pipeline...');

    // Progressive multi-step upscaling with Lanczos
    let pipeline = sharp(imageBuffer, { failOn: 'none' }).rotate();

    // Denoise first (median filter to reduce grain)
    pipeline = pipeline.median(2);

    // Progressive upscaling in 2x steps
    let w = metadata.width;
    let h = metadata.height;
    
    while (w * 2 < targetWidth && h * 2 < targetHeight) {
      w = Math.round(w * 2);
      h = Math.round(h * 2);
      pipeline = pipeline.resize(w, h, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      });
      console.log(`[Processing] Upscaled to ${w}x${h}px`);
    }

    // Final resize to exact target
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    });
    console.log(`[Processing] Final resize to ${targetWidth}x${targetHeight}px`);

    // Sharpen for detail recovery
    pipeline = pipeline.sharpen({
      sigma: 1.2,
      m1: 0.5,
      m2: 2.5,
    });
    console.log('[Processing] Applied sharpening filter');

    // Boost saturation slightly for color restoration
    pipeline = pipeline.modulate({
      saturation: 1.1,
    });
    console.log('[Processing] Applied color enhancement');

    // Encode to PNG with high compression
    const outputBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    
    // Save the processed image
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`[Processing] Saved processed image: ${outputPath}`);
    console.log(`[Processing] Output size: ${outputBuffer.length} bytes`);
    console.log(`[Processing] Compression ratio: ${(imageBuffer.length / outputBuffer.length).toFixed(2)}x`);
    console.log('[Processing] Complete!');

  } catch (error) {
    console.error('[Processing] Error:', error.message);
    process.exit(1);
  }
}

processImage();
