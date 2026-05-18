'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

interface Question {
  id: string;
  text: string;
  type: 'yesno' | 'short';
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  availability: string;
  experience: string;
  questions: Question[];
}

export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setJob(data); });
  }, [jobId]);

  function setAnswer(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('applicantName', name);
    formData.append('applicantEmail', email);
    formData.append('answers', JSON.stringify(answers));
    if (resume) formData.append('resume', resume);

    try {
      const res = await fetch('/api/apply', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h1>
          <p className="text-gray-500">This application link may have expired or is incorrect. Check with your employer.</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-3">Application Sent!</h1>
          <p className="text-gray-500 text-lg">Your application has been submitted. The hiring team will be in touch if you are a good fit.</p>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white font-semibold text-lg">Loading application...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">{job.title}</h1>
          <p className="text-violet-200">Complete the form below to apply</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 mb-6">
          <h2 className="text-sm font-semibold text-violet-200 uppercase tracking-wide mb-2">About this role</h2>
          <p className="text-white leading-relaxed mb-4">{job.description}</p>
          <div className="flex flex-wrap gap-2">
            {job.location && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-violet-100 bg-white/10 px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {job.location}
              </span>
            )}
            {job.availability && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-violet-100 bg-white/10 px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {job.availability}
              </span>
            )}
            {job.experience && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-violet-100 bg-white/10 px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {job.experience}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Resume <span className="font-normal text-gray-400">(PDF or text file)</span>
                </label>
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-violet-400 transition group">
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-violet-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-gray-500 group-hover:text-violet-600 transition">
                    {resume ? resume.name : 'Click to upload your resume'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={e => setResume(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Screening Questions</h2>
            <div className="space-y-5">
              {job.questions.map(q => (
                <div key={q.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{q.text}</label>
                  {q.type === 'yesno' ? (
                    <div className="flex gap-3">
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(q.id, opt)}
                          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                            answers[q.id] === opt
                              ? opt === 'Yes'
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-red-400 text-white shadow-md'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Your answer..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-violet-700 font-black py-4 rounded-2xl shadow-xl hover:bg-violet-50 transition disabled:opacity-60 text-lg"
          >
            {loading ? 'Submitting your application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </main>
  );
}
