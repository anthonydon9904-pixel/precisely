'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

interface Question { id: string; text: string; type: 'yesno' | 'short'; }
interface Job { id: string; title: string; description: string; questions: Question[]; timeSlots: { id: string; datetime: string; available: boolean }[]; }
interface Application { id: string; applicantName: string; applicantEmail: string; answers: Record<string, string>; score: number; recommendation: 'Advance' | 'Maybe' | 'Pass'; reasoning: string; submittedAt: string; }
interface Scheduled { applicantName: string; applicantEmail: string; round: number; datetime: string; }
interface Invite { id: string; applicationId: string; applicantName: string; round: number; bookedSlotId: string | null; }

const recStyles = {
  Advance: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Maybe: 'bg-amber-100 text-amber-700 border border-amber-200',
  Pass: 'bg-red-100 text-red-700 border border-red-200',
};
const scoreColor = (s: number) => s >= 8 ? 'text-emerald-600' : s >= 5 ? 'text-amber-500' : 'text-red-500';

export default function Dashboard({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [scheduled, setScheduled] = useState<Scheduled[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'applicants' | 'schedule'>('applicants');
  const [inviteModal, setInviteModal] = useState<Application | null>(null);
  const [inviteRound, setInviteRound] = useState(1);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ link: string } | null>(null);

  const applyLink = typeof window !== 'undefined' ? `${window.location.origin}/apply/${jobId}` : '';

  async function load() {
    const [jobRes, appRes, intRes] = await Promise.all([
      fetch(`/api/jobs/${jobId}`),
      fetch(`/api/applications/${jobId}`),
      fetch(`/api/interviews/${jobId}`),
    ]);
    const jobData = await jobRes.json();
    const appData = await appRes.json();
    const intData = intRes.ok ? await intRes.json() : { scheduled: [], invites: [] };
    setJob(jobData);
    setApplications(appData);
    setScheduled(intData.scheduled ?? []);
    setInvites(intData.invites ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [jobId]);

  async function copyLink() {
    await navigator.clipboard.writeText(applyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportCSV() {
    const qHeaders = job?.questions.map(q => `"${q.text.replace(/"/g, '""')}"`) ?? [];
    const headers = ['Name', 'Email', 'Score', 'Recommendation', 'Reasoning', ...qHeaders, 'Submitted'];
    const rows = applications.map(app => {
      const qAnswers = job?.questions.map(q => `"${(app.answers[q.id] ?? '').replace(/"/g, '""')}"`) ?? [];
      return [`"${app.applicantName}"`, `"${app.applicantEmail}"`, app.score, app.recommendation, `"${app.reasoning.replace(/"/g, '""')}"`, ...qAnswers, `"${new Date(app.submittedAt).toLocaleString()}"`];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job?.title ?? 'applicants'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportScheduleCSV() {
    const headers = ['Name', 'Email', 'Round', 'Interview Time'];
    const rows = scheduled.map(s => [`"${s.applicantName}"`, `"${s.applicantEmail}"`, `Round ${s.round}`, `"${new Date(s.datetime).toLocaleString()}"`]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job?.title ?? 'interviews'}-schedule.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function sendInvite() {
    if (!inviteModal) return;
    setInviteSending(true);
    setInviteResult(null);
    const res = await fetch('/api/interviews/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, applicationId: inviteModal.id, round: inviteRound }),
    });
    const data = await res.json();
    setInviteSending(false);
    if (res.ok) {
      setInviteResult({ link: data.bookingLink });
      load();
    }
  }

  const alreadyInvited = (appId: string) => invites.some(i => i.applicationId === appId);
  const hasSlots = (job?.timeSlots ?? []).some(s => s.available);

  if (loading) return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center">
      <div className="text-violet-600 font-semibold text-lg">Loading your dashboard...</div>
    </main>
  );

  const sorted = [...applications].sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <a href="/employer/jobs" className="text-violet-600 hover:text-violet-800 font-medium text-sm">← My job postings</a>
            <h1 className="text-4xl font-black text-gray-900 mt-4 mb-1">{job?.title}</h1>
            <p className="text-gray-500">{applications.length} application{applications.length !== 1 ? 's' : ''} received</p>
          </div>
          <div className="mt-8 flex gap-2">
            {applications.length > 0 && (
              <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-violet-200 text-violet-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-violet-50 transition shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Apply link */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-violet-100 mb-6">
          <p className="text-sm font-semibold text-gray-600 mb-2">Share this link with applicants</p>
          <div className="flex gap-3 items-center">
            <div className="flex-1 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-sm text-violet-800 font-mono truncate">{applyLink}</div>
            <button onClick={copyLink} className={`px-4 py-3 rounded-xl font-semibold text-sm transition whitespace-nowrap ${copied ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-violet-100 mb-6">
          <button onClick={() => setTab('applicants')} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${tab === 'applicants' ? 'bg-violet-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            Applicants
          </button>
          <button onClick={() => setTab('schedule')} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${tab === 'schedule' ? 'bg-violet-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            Interview Schedule {scheduled.length > 0 && `(${scheduled.length})`}
          </button>
        </div>

        {/* Applicants tab */}
        {tab === 'applicants' && (
          sorted.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-violet-100 text-center">
              <p className="text-gray-500 text-lg">No applications yet. Share the link above to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map(app => (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
                  <div className="p-5 flex items-center gap-4 cursor-pointer hover:bg-violet-50 transition" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                    <div className="text-center w-14">
                      <div className={`text-3xl font-black ${scoreColor(app.score)}`}>{app.score}</div>
                      <div className="text-xs text-gray-400">/ 10</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-bold text-gray-800">{app.applicantName}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${recStyles[app.recommendation]}`}>{app.recommendation}</span>
                        {alreadyInvited(app.id) && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-600 border border-indigo-200">Invited</span>}
                      </div>
                      <p className="text-sm text-gray-500">{app.applicantEmail}</p>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{app.reasoning}</p>
                    </div>
                    <div className="text-gray-300">
                      <svg className={`w-5 h-5 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {expanded === app.id && (
                    <div className="border-t border-violet-100 p-5 bg-violet-50">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">AI Reasoning</h3>
                        <p className="text-gray-700">{app.reasoning}</p>
                      </div>
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Answers</h3>
                        <div className="space-y-2">
                          {job?.questions.map(q => (
                            <div key={q.id} className="bg-white rounded-xl p-4 border border-violet-100">
                              <p className="text-sm font-medium text-gray-600 mb-1">{q.text}</p>
                              <p className="text-gray-800 font-semibold">{app.answers[q.id] || 'No answer'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {app.recommendation === 'Advance' && hasSlots && (
                        <button
                          onClick={e => { e.stopPropagation(); setInviteModal(app); setInviteRound(1); setInviteResult(null); }}
                          className="mt-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Send Interview Invite
                        </button>
                      )}
                      <p className="text-xs text-gray-400 mt-4">Submitted {new Date(app.submittedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Schedule tab */}
        {tab === 'schedule' && (
          <div>
            {scheduled.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-violet-100 text-center">
                <p className="text-gray-500 text-lg">No interviews scheduled yet.</p>
                <p className="text-gray-400 text-sm mt-1">Send interview invites to advanced applicants from the Applicants tab.</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-3">
                  <button onClick={exportScheduleCSV} className="flex items-center gap-2 bg-white border border-violet-200 text-violet-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-violet-50 transition shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Schedule CSV
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-violet-50 border-b border-violet-100">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Applicant</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Round</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-50">
                      {scheduled.map((s, i) => (
                        <tr key={i} className="hover:bg-violet-50 transition">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-800">{s.applicantName}</p>
                            <p className="text-sm text-gray-400">{s.applicantEmail}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">Round {s.round}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-700 font-medium">
                            {new Date(s.datetime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            {inviteResult ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Invite Sent!</h2>
                <p className="text-gray-500 mb-4">Email sent to {inviteModal.applicantEmail}. You can also share the booking link directly:</p>
                <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-sm text-violet-800 font-mono break-all mb-6">{inviteResult.link}</div>
                <button onClick={() => { setInviteModal(null); setInviteResult(null); }} className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-800 mb-1">Send Interview Invite</h2>
                <p className="text-gray-500 mb-6">Sending to <strong>{inviteModal.applicantName}</strong> ({inviteModal.applicantEmail})</p>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Which round is this?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(r => (
                      <button key={r} onClick={() => setInviteRound(r)} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${inviteRound === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        Round {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setInviteModal(null)} className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                  <button onClick={sendInvite} disabled={inviteSending} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60">
                    {inviteSending ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
