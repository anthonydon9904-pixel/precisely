import { NextRequest, NextResponse } from 'next/server';
import { getInvitesForJob, getJob, getEmployerFromToken } from '@/lib/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const token = req.cookies.get('session')?.value;
  const employer = token ? getEmployerFromToken(token) : null;
  if (!employer) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const job = getJob(jobId);
  if (!job || job.employerId !== employer.id) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const invites = getInvitesForJob(jobId);
  const slots = job.timeSlots;

  const scheduled = invites
    .filter(i => i.bookedSlotId)
    .map(i => {
      const slot = slots.find(s => s.id === i.bookedSlotId);
      return {
        applicantName: i.applicantName,
        applicantEmail: i.applicantEmail,
        round: i.round,
        datetime: slot?.datetime ?? null,
      };
    })
    .sort((a, b) => new Date(a.datetime ?? 0).getTime() - new Date(b.datetime ?? 0).getTime());

  return NextResponse.json({ invites, scheduled });
}
