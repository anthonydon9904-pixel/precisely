'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  availability: string;
  experience: string;
  questions: { id: string; text: string; type: string }[];
  createdAt: string;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => { setJobs(data); setLoading(false); });
  }, []);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-violet-200 hover:text-white font-medium text-sm">← Back to home</a>
          <h1 className="text-4xl font-black text-white mt-4 mb-2">Open Roles</h1>
          <p className="text-violet-200">Find a position and apply in minutes</p>
        </div>

        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full bg-white rounded-2xl pl-12 pr-4 py-4 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-lg transition"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-violet-200 text-lg">Loading open roles...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/10 rounded-3xl p-12 text-center border border-white/20">
            <p className="text-white text-lg font-semibold mb-1">
              {search ? 'No jobs match your search' : 'No open roles right now'}
            </p>
            <p className="text-violet-200 text-sm">
              {search ? 'Try a different keyword' : 'Check back soon'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(job => (
              <Link key={job.id} href={`/apply/${job.id}`}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-violet-700 transition mb-2">
                        {job.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {job.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {job.location}
                          </span>
                        )}
                        {job.availability && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {job.availability}
                          </span>
                        )}
                        {job.experience && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {job.experience}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-violet-300 group-hover:text-violet-600 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
