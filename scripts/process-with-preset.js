const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Preset parameter mappings (based on presets.ts)
const PRESETS = {
  vintage_restoration: {
    brightness: 1.14,
    saturation: 1.32,
    sharpen_sigma: 2.0,
    contrast: 1.18
  },
  landscape_enhancement: {
    brightness: 1.20,
    saturation: 1.50,
    sharpen_sigma: 2.8,
    contrast: 1.25
  },
  portrait: {
    brightness: 1.08,
    saturation: 1.25,
    sharpen_sigma: 1.5,
    contrast: 1.15
  },
  architecture: {
    brightness: 1.18,
    saturation: 1.40,
    sharpen_sigma: 3.0,
    contrast: 1.28
  },
  nature: {
    brightness: 1.16,
    saturation: 1.45,
    sharpen_sigma: 2.5,
    contrast: 1.22
  },
  vivid: {
    brightness: 1.25,
    saturation: 1.80,
    sharpen_sigma: 4.5,
    contrast: 1.35
  },
  full_spectrum: {
    brightness: 1.15,
    saturation: 1.35,
    sharpen_sigma: 2.0,
    contrast: 1.20
  }
};

async function processImageWithPreset(inputPath, outputPath, presetId) {
  const preset = PRESETS[presetId] || PRESETS.full_spectrum;

  console.log(`[Processor] Starting ${presetId} restoration...`);
  console.log(`[Processor] Input: ${inputPath}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`[Processor] Original: ${metadata.width}×${metadata.height}px`);

    const processed = await image
      .median(2)
      .blur(1.2)
      .resize(Math.round(metadata.width * 2), Math.round(metadata.height * 2), { kernel: 'lanczos3' })
      .resize(Math.round(metadata.width * 4), Math.round(metadata.height * 4), { kernel: 'lanczos3' })
      .modulate({
        brightness: preset.brightness,
        saturation: preset.saturation
      })
      .linear(preset.contrast, 5)
      .sharpen({ sigma: preset.sharpen_sigma })
      .sharpen({ sigma: 1.5 })
      .gamma(1.05)
      .toBuffer();

    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    await fs.promises.writeFile(outputPath, processed);
    const newStats = fs.statSync(outputPath);

    console.log(`[Processor] Output: ${outputPath}`);
    console.log(`[Processor] Size: ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`[Processor] ✓ Complete - Preset: ${presetId}`);
    console.log(`  Brightness: ${preset.brightness}x, Saturation: ${preset.saturation}x`);
    console.log(`  Sharpen: ${preset.sharpen_sigma}, Contrast: ${preset.contrast}x`);

  } catch (err) {
    console.error('[Processor] Error:', err.message);
    process.exit(1);
  }
}

// Get arguments from command line
const args = process.argv.slice(2);
const inputPath = args[0] || path.join(__dirname, '../public/deteriorated-test.png');
const outputPath = args[1] || path.join(__dirname, '../public/processed-result.png');
const presetId = args[2] || 'vintage_restoration';

processImageWithPreset(inputPath, outputPath, presetId);
