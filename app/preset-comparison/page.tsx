export default function PresetComparison() {
  return (
    <main className="min-h-screen bg-[#1a1410] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#e8e4dd] mb-2">Preset Comparison</h1>
        <p className="text-[#b8aca0] mb-12">Testing different N3uralia presets on various image types</p>

        {/* Test 1: Vintage Photo */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#d4a574] mb-6">Test 1: Vintage Family Photograph</h2>
          <p className="text-[#b8aca0] mb-4">Original: Sepia-toned deteriorated photo. Testing how presets handle color preservation.</p>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Original */}
            <div className="rounded-xl overflow-hidden border border-[#3a3530]">
              <div className="relative aspect-square bg-[#1f1a16] flex items-center justify-center">
                <img
                  src="/deteriorated-test.png"
                  alt="Original vintage photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-[#1f1a16] border-t border-[#3a3530]">
                <p className="font-semibold text-[#e8e4dd] text-sm">Original</p>
                <p className="text-xs text-[#8b8278]">Deteriorated</p>
              </div>
            </div>

            {/* Vintage Restoration Preset */}
            <div className="rounded-xl overflow-hidden border border-[#3a3530]">
              <div className="relative aspect-square bg-[#1f1a16] flex items-center justify-center">
                <img
                  src="/processed-vintage.png"
                  alt="Vintage Restoration preset"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-[#1f1a16] border-t border-[#3a3530]">
                <p className="font-semibold text-[#d4a574] text-sm">Vintage Restoration</p>
                <p className="text-xs text-[#8b8278]">brightness 1.14x, sat 1.32x</p>
              </div>
            </div>

            {/* Landscape Enhancement Preset (Wrong choice) */}
            <div className="rounded-xl overflow-hidden border border-[#3a3530]">
              <div className="relative aspect-square bg-[#1f1a16] flex items-center justify-center">
                <img
                  src="/processed-vintage-landscape.png"
                  alt="Landscape Enhancement preset"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-[#1f1a16] border-t border-[#3a3530]">
                <p className="font-semibold text-[#e8e4dd] text-sm">Landscape Enhancement</p>
                <p className="text-xs text-[#8b8278]">brightness 1.20x, sat 1.50x (wrong)</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#2d2620] rounded-lg border border-[#3a3530]">
            <p className="text-[#d4a574] font-semibold mb-2">Analysis:</p>
            <ul className="text-[#b8aca0] text-sm space-y-1">
              <li>✓ Vintage Restoration: Preserves sepia tones naturally, subtle enhancement</li>
              <li>✗ Landscape Enhancement: Too much saturation, makes image too yellowish</li>
              <li>→ Conclusion: Vintage Restoration preset is better for this image type</li>
            </ul>
          </div>
        </section>

        {/* Test 2: Landscape Photo */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#d4a574] mb-6">Test 2: Landscape with Blue Sky</h2>
          <p className="text-[#b8aca0] mb-4">Original: Modern landscape photo with trees and sky. Testing color recovery.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="rounded-xl overflow-hidden border border-[#3a3530]">
              <div className="relative aspect-square bg-[#1f1a16] flex items-center justify-center">
                <img
                  src="/test-photo-2.png"
                  alt="Original landscape"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-[#1f1a16] border-t border-[#3a3530]">
                <p className="font-semibold text-[#e8e4dd] text-sm">Original</p>
                <p className="text-xs text-[#8b8278]">Degraded</p>
              </div>
            </div>

            {/* Landscape Enhancement Preset (Correct choice) */}
            <div className="rounded-xl overflow-hidden border border-[#3a3530]">
              <div className="relative aspect-square bg-[#1f1a16] flex items-center justify-center">
                <img
                  src="/processed-landscape.png"
                  alt="Landscape Enhancement preset"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-[#1f1a16] border-t border-[#3a3530]">
                <p className="font-semibold text-[#d4a574] text-sm">Landscape Enhancement</p>
                <p className="text-xs text-[#8b8278]">brightness 1.20x, sat 1.50x</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#2d2620] rounded-lg border border-[#3a3530]">
            <p className="text-[#d4a574] font-semibold mb-2">Analysis:</p>
            <ul className="text-[#b8aca0] text-sm space-y-1">
              <li>✓ Landscape Enhancement: Sky is now vibrant blue, not yellowish</li>
              <li>✓ Vegetation textures are crisp and detailed</li>
              <li>✓ Natural colors recovered without artificial tinting</li>
              <li>→ Conclusion: Landscape Enhancement preset works perfectly for natural scenery</li>
            </ul>
          </div>
        </section>

        {/* Summary */}
        <section className="p-6 bg-[#2d2620] rounded-lg border border-[#d4a574]">
          <h3 className="text-xl font-bold text-[#d4a574] mb-4">Summary</h3>
          <ul className="space-y-2 text-[#b8aca0]">
            <li><strong>Vintage Restoration Preset:</strong> Better for sepia-toned, aged photographs. Lower saturation preserves original character while enhancing clarity.</li>
            <li><strong>Landscape Enhancement Preset:</strong> Better for modern scenery with sky and vegetation. Higher saturation brings out natural colors without introducing yellow tint.</li>
            <li><strong>Key Finding:</strong> The yellow tint observed earlier was NOT a processing error—it was the correct enhancement of the vintage photo's inherent sepia tones.</li>
            <li><strong>Recommendation:</strong> Always choose the preset that matches your image content type for optimal results.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
