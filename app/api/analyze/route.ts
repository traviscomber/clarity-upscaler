import { analyzeImage } from '@/lib/n3uralia/analyzer';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return Response.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate image size (max 50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      return Response.json(
        { error: 'Image too large (max 50MB)' },
        { status: 413 }
      );
    }

    const startTime = Date.now();
    const analysis = await analyzeImage(buffer);
    const analysisTime = Date.now() - startTime;

    return Response.json({
      success: true,
      analysis,
      metadata: {
        fileSize: buffer.length,
        fileName: file.name,
        analysisTime,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json(
      { 
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
