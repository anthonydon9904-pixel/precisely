import { NextRequest, NextResponse } from 'next/server';
import { getJobsForEmployer, getEmployerFromToken } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const employer = token ? getEmployerFromToken(token) : null;
  if (!employer) return NextResponse.json(null);
  return NextResponse.json(getJobsForEmployer(employer.id));
}
