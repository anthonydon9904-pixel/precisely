'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CalendarPicker from './CalendarPicker';

interface Question {
  text: string;
  type: 'yesno' | 'short';
}

export default function EmployerSetup() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', type: 'yesno' },
  ]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addQuestion() {
    setQuestions([...questions, { text: '', type: 'yesno' }]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof Question, value: string) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const filled = questions.filter(q => q.text.trim());
    if (!filled.length) {
      setError('Add at least one question.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, location, availability, experience, questions: filled, timeSlots: timeSlots.filter(s => s.trim()) }),
      });
      const job = await res.json();
      router.push(`/employer/dashboard/${job.id}`);
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-violet-600 hover:text-violet-800 font-medium text-sm">← Back to home</a>
          <h1 className="text-4xl font-black text-gray-900 mt-4 mb-2">Set Up Your Job</h1>
          <p className="text-gray-500">Fill in the details and add your screening questions. We will handle the rest.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and what you are looking for..."
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Luis Obispo, CA or Remote"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability &amp; Expected Hours</label>
                <input
                  type="text"
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  placeholder="e.g. Full-time, 40 hrs/week or Part-time, weekends"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Prior Experience</label>
                <input
                  type="text"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="e.g. 2+ years in customer service, or No experience required"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Screening Questions</h2>
                <p className="text-sm text-gray-400">Choose yes/no for simple checks, or short answer for more detail</p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestion(i, 'text', e.target.value)}
                      placeholder={q.type === 'yesno' ? 'e.g. Do you have 3+ years of experience?' : 'e.g. Describe your biggest achievement'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(i, 'type', 'yesno')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          q.type === 'yesno'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        Yes / No
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuestion(i, 'type', 'short')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          q.type === 'short'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        Short Answer
                      </button>
                    </div>
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="mt-3 text-red-400 hover:text-red-600 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 w-full border-2 border-dashed border-violet-300 rounded-xl py-3 text-violet-500 hover:border-violet-500 hover:text-violet-700 font-medium transition"
            >
              + Add another question
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">Interview Time Slots</h2>
              <p className="text-sm text-gray-400">Optional — click a day then pick times. Advanced applicants can self-schedule.</p>
            </div>
            <CalendarPicker onChange={setTimeSlots} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition disabled:opacity-60 text-lg"
          >
            {loading ? 'Creating your job...' : 'Create Job & Get Applicant Link'}
          </button>
        </form>
      </div>
    </main>
  );
}
