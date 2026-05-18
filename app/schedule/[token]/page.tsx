'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

interface Slot { id: string; datetime: string; }
interface Invite { applicantName: string; round: number; bookedSlotId: string | null; }

export default function SchedulePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [jobTitle, setJobTitle] = useState('');
  const [invite, setInvite] = useState<Invite | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/schedule/${token}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(data => {
        if (!data) return;
        setJobTitle(data.jobTitle);
        setInvite(data.invite);
        setSlots(data.availableSlots);
        if (data.invite.bookedSlotId) setBooked(true);
        setLoading(false);
      });
  }, [token]);

  async function handleBook() {
    if (!selected) return;
    setSubmitting(true);
    const res = await fetch(`/api/schedule/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: selected }),
    });
    if (res.ok) {
      setBooked(true);
    } else {
      setError('That slot was just taken. Please pick another.');
      setSubmitting(false);
      fetch(`/api/schedule/${token}`).then(r => r.json()).then(d => setSlots(d.availableSlots));
    }
  }

  if (notFound) return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
        <p className="text-2xl font-bold text-gray-800 mb-2">Link not found</p>
        <p className="text-gray-500">This scheduling link is invalid or has expired.</p>
      </div>
    </main>
  );

  if (loading) return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center">
      <p className="text-white font-semibold text-lg">Loading your invitation...</p>
    </main>
  );

  const roundLabel = invite?.round === 1 ? 'Round 1' : invite?.round === 2 ? 'Round 2' : `Round ${invite?.round}`;

  if (booked) return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-800 mb-3">You are booked!</h1>
        <p className="text-gray-500 text-lg">Your interview has been scheduled. The hiring team will be in touch with details. Good luck!</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Precisely</h1>
          <p className="text-violet-200">Interview Scheduling</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-gray-800 mb-1">Hi {invite?.applicantName}!</h2>
          <p className="text-gray-500 mb-6">
            Pick a time for your <strong>{roundLabel}</strong> interview for <strong>{jobTitle}</strong>.
          </p>

          {slots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No time slots are available right now. The employer will be in touch shortly.
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {slots.map(slot => {
                const d = new Date(slot.datetime);
                const isSelected = selected === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelected(slot.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-100 hover:border-violet-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">
                          {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'}`}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleBook}
            disabled={!selected || submitting}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition disabled:opacity-40 text-lg"
          >
            {submitting ? 'Booking...' : 'Confirm This Time'}
          </button>
        </div>
      </div>
    </main>
  );
}
