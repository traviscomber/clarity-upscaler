import { enhanceImage } from '@/lib/n3uralia/processing';
import type { EnhancementStrategy } from '@/lib/n3uralia/engine';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const strategyJson = formData.get('strategy') as string;

    if (!file || !strategyJson) {
      return Response.json(
        { error: 'Missing image or strategy' },
        { status: 400 }
      );
    }

    const strategy: EnhancementStrategy = JSON.parse(strategyJson);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image
    const startTime = Date.now();
    const enhancedBuffer = await enhanceImage(buffer, strategy);
    const processingTime = Date.now() - startTime;

    // Return as blob
    return new Response(enhancedBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': enhancedBuffer.length,
        'X-Processing-Time': processingTime.toString(),
      },
    });
  } catch (error) {
    console.error('Enhancement error:', error);
    return Response.json(
      { error: 'Failed to enhance image' },
      { status: 500 }
    );
  }
}
