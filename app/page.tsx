import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight">Precisely</h1>
          <p className="text-violet-200 text-xl font-medium">Smart resume screening, powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/employer/jobs">
            <div className="bg-white rounded-3xl p-10 shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-violet-200 transition-colors">
                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">I am Hiring</h2>
              <p className="text-gray-500">Set up a job posting and review applicants with AI scoring</p>
            </div>
          </Link>

          <Link href="/jobs">
          <div className="bg-white/10 backdrop-blur rounded-3xl p-10 border border-white/20 hover:scale-105 transition-all duration-200 cursor-pointer">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">I am Applying</h2>
            <p className="text-violet-200">Browse open roles and apply directly — no link needed</p>
          </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
