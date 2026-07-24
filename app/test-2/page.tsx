export default function TestPage2() {
  return (
    <main className="min-h-screen bg-[#1a1410] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#e8e4dd] mb-8">Test 2: Landscape Photo Processing</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className="relative rounded-xl overflow-hidden border border-[#3a3530] bg-[#1f1a16] aspect-square flex items-center justify-center">
            <img
              src="/test-photo-2.png"
              alt="Before - Degraded landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#1a1410]/80 backdrop-blur-sm rounded-md text-xs text-[#e8e4dd] border border-[#3a3530] font-medium">
              Before
            </div>
          </div>

          {/* After */}
          <div className="relative rounded-xl overflow-hidden border border-[#3a3530] bg-[#1f1a16] aspect-square flex items-center justify-center">
            <img
              src="/processed-test-2.png"
              alt="After - Enhanced landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#d4a574]/20 backdrop-blur-sm rounded-md text-xs text-[#d4a574] border border-[#d4a574]/30 font-medium">
              After
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#d4a574] mb-4">Analysis</h2>
          <p className="text-[#b8aca0]">
            This test uses a completely different source image (landscape instead of vintage sepia-toned family photo).
            If yellow tint appears in After image, it&apos;s a processing issue. If it doesn&apos;t, the tint is inherent to the source material.
          </p>
        </div>
      </div>
    </main>
  );
}
