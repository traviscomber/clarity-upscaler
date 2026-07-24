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

    const buffer = Buffer.from(await file.arrayBuffer());
    const analysis = await analyzeImage(buffer);

    return Response.json({ success: true, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
