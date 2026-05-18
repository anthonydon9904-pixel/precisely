import { NextRequest, NextResponse } from 'next/server';
import { getInviteByToken, getJob, bookSlot } from '@/lib/storage';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = getInviteByToken(token);
  if (!invite) return NextResponse.json({ error: 'Invalid link.' }, { status: 404 });

  const job = getJob(invite.jobId);
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });

  return NextResponse.json({
    invite,
    jobTitle: job.title,
    availableSlots: job.timeSlots.filter(s => s.available),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { slotId } = await req.json();
  const success = bookSlot(token, slotId);
  if (!success) return NextResponse.json({ error: 'Slot unavailable or already booked.' }, { status: 409 });
  return NextResponse.json({ ok: true });
}
