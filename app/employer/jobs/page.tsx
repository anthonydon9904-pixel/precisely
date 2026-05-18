'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  availability: string;
  questions: { id: string }[];
  createdAt: string;
}

export default function MyJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(employer => {
        if (!employer) { router.push('/employer/login'); return; }
        setEmail(employer.email);
        return fetch('/api/jobs/mine');
      })
      .then(r => r?.json())
      .then(data => { if (data) { setJobs(data); setLoading(false); } });
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center">
        <div className="text-violet-500 font-semibold">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="text-violet-600 hover:text-violet-800 font-medium text-sm">← Back to home</a>
            <h1 className="text-4xl font-black text-gray-900 mt-4 mb-1">My Job Postings</h1>
            <p className="text-gray-400 text-sm">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition"
          >
            Sign out
          </button>
        </div>

        <Link href="/employer/setup">
          <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-6 py-4 mb-6 shadow-lg hover:from-violet-700 hover:to-indigo-700 transition cursor-pointer">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-white font-bold">Post a new job</span>
          </div>
        </Link>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-violet-100">
            <p className="text-gray-500 text-lg">No jobs posted yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...jobs].reverse().map(job => (
              <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.location && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{job.location}</span>
                      )}
                      {job.availability && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{job.availability}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/employer/dashboard/${job.id}`}>
                    <button className="whitespace-nowrap bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
                      View Applicants
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
