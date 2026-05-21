import { NextRequest, NextResponse } from 'next/server';
import { getJob, createApplication } from '@/lib/storage';
import { scoreApplication } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const jobId = formData.get('jobId') as string;
    const applicantName = formData.get('applicantName') as string;
    const applicantEmail = formData.get('applicantEmail') as string;
    const answersJson = formData.get('answers') as string;
    const resumeFile = formData.get('resume') as File | null;

    if (!jobId || !applicantName || !applicantEmail || !answersJson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const answers = JSON.parse(answersJson);

    let resumeText = '';
    if (resumeFile && resumeFile.size > 0) {
      try {
        const buffer = Buffer.from(await resumeFile.arrayBuffer());
        if (!resumeFile.name.toLowerCase().endsWith('.pdf')) {
          resumeText = buffer.toString('utf-8');
        }
        // PDF text extraction skipped — score is based on answers
      } catch {
        resumeText = '';
      }
    }

    let score = 5;
    let recommendation: 'Advance' | 'Maybe' | 'Pass' = 'Maybe';
    let reasoning = 'AI scoring unavailable — please review manually.';

    try {
      const result = await scoreApplication(
        job.title,
        job.description,
        job.questions,
        answers,
        resumeText
      );
      score = result.score;
      recommendation = result.recommendation;
      reasoning = result.reasoning;
    } catch (aiErr) {
      console.error('AI scoring failed, using defaults:', aiErr);
    }

    const application = createApplication({
      jobId,
      applicantName,
      applicantEmail,
      answers,
      resumeText,
      score,
      recommendation,
      reasoning,
    });

    return NextResponse.json(application);
  } catch (err) {
    console.error('Apply error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
