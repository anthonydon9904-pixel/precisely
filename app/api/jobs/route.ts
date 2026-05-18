import { NextRequest, NextResponse } from 'next/server';
import { createJob, getJobs, getJobsForEmployer, getEmployerFromToken } from '@/lib/storage';

export async function GET() {
  const jobs = getJobs();
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const employer = token ? getEmployerFromToken(token) : null;
  if (!employer) {
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, location, availability, experience, questions, timeSlots } = body;
  if (!title || !description || !questions?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const job = createJob(employer.id, title, description, location ?? '', availability ?? '', experience ?? '', questions, timeSlots ?? []);
  return NextResponse.json(job);
}

export async function GET_MINE(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const employer = token ? getEmployerFromToken(token) : null;
  if (!employer) return NextResponse.json([], { status: 401 });
  return NextResponse.json(getJobsForEmployer(employer.id));
}
