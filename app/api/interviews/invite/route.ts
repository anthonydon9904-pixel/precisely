import { NextRequest, NextResponse } from 'next/server';
import { getEmployerFromToken, getJob, getApplicationsForJob, createInvite } from '@/lib/storage';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const employer = token ? getEmployerFromToken(token) : null;
  if (!employer) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const { jobId, applicationId, round } = await req.json();
  const job = getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });

  const applications = getApplicationsForJob(jobId);
  const application = applications.find(a => a.id === applicationId);
  if (!application) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

  const availableSlots = job.timeSlots.filter(s => s.available);
  if (availableSlots.length === 0) return NextResponse.json({ error: 'No available time slots.' }, { status: 400 });

  const invite = createInvite(jobId, applicationId, application.applicantName, application.applicantEmail, round);
  const origin = req.headers.get('origin') || 'http://localhost:3000';
  const bookingLink = `${origin}/schedule/${invite.token}`;

  const roundLabel = round === 1 ? 'first' : round === 2 ? 'second' : round === 3 ? 'third' : `${round}th`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: application.applicantEmail,
    subject: `Interview Invitation — ${job.title} (Round ${round})`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 8px;">Precisely</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">Interview Scheduling</p>
        <h2 style="color: #111827; font-size: 20px;">Hi ${application.applicantName},</h2>
        <p style="color: #374151; line-height: 1.6;">
          Congratulations! After reviewing your application for <strong>${job.title}</strong>,
          we'd like to invite you to a ${roundLabel} round interview.
        </p>
        <p style="color: #374151; line-height: 1.6;">
          Please click the button below to pick a time that works for you.
        </p>
        <a href="${bookingLink}" style="display: inline-block; margin: 24px 0; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
          Pick Your Interview Time
        </a>
        <p style="color: #9ca3af; font-size: 14px;">
          If the button doesn't work, copy and paste this link:<br/>
          <a href="${bookingLink}" style="color: #7c3aed;">${bookingLink}</a>
        </p>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">Precisely — Smart hiring, made simple.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, bookingLink });
}
