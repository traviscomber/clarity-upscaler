// Simple in-memory job tracking (in production, use a database)
const jobs = new Map<
  string,
  {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    imageFileName: string;
    model: string;
    scaleFactor: number;
    createdAt: Date;
    completedAt?: Date;
    error?: string;
  }
>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (jobId) {
      const job = jobs.get(jobId);
      if (!job) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }
      return Response.json({ success: true, job });
    }

    // Return all jobs
    return Response.json({
      success: true,
      jobs: Array.from(jobs.values()),
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    return Response.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageFileName, model, scaleFactor } = body;

    if (!imageFileName || !model || !scaleFactor) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new job
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: jobId,
      status: 'pending' as const,
      progress: 0,
      imageFileName,
      model,
      scaleFactor,
      createdAt: new Date(),
    };

    jobs.set(jobId, job);

    // Simulate processing
    setTimeout(() => {
      const existingJob = jobs.get(jobId);
      if (existingJob) {
        existingJob.status = 'processing';
        existingJob.progress = 25;
      }
    }, 500);

    setTimeout(() => {
      const existingJob = jobs.get(jobId);
      if (existingJob) {
        existingJob.progress = 60;
      }
    }, 2000);

    setTimeout(() => {
      const existingJob = jobs.get(jobId);
      if (existingJob) {
        existingJob.status = 'completed';
        existingJob.progress = 100;
        existingJob.completedAt = new Date();
      }
    }, 4000);

    return Response.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Job creation error:', error);
    return Response.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
