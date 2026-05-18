import { NextRequest, NextResponse } from 'next/server';
import { getJob, createApplication } from '@/lib/storage';
import { scoreApplication } from '@/lib/gemini';

export async function POST(req: NextRequest) {
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
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    if (resumeFile.name.toLowerCase().endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buffer);
      resumeText = parsed.text;
    } else {
      resumeText = buffer.toString('utf-8');
    }
  }

  const { score, recommendation, reasoning } = await scoreApplication(
    job.title,
    job.description,
    job.questions,
    answers,
    resumeText
  );

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
}
