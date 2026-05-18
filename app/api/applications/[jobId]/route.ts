import { NextRequest, NextResponse } from 'next/server';
import { getApplicationsForJob } from '@/lib/storage';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const applications = getApplicationsForJob(jobId);
  return NextResponse.json(applications);
}
