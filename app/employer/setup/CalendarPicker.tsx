'use client';

import { useState } from 'react';

const TIMES = Array.from({ length: 20 }, (_, i) => {
  const totalMins = 8 * 60 + i * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const label = `${h > 12 ? h - 12 : h}:${m === 0 ? '00' : m} ${h >= 12 ? 'PM' : 'AM'}`;
  const value = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : m}`;
  return { label, value };
});

interface Props {
  onChange: (slots: string[]) => void;
}

export default function CalendarPicker({ onChange }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  // key: "YYYY-MM-DD", value: set of "HH:MM" strings
  const [slots, setSlots] = useState<Record<string, Set<string>>>({});

  function toKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function notify(next: Record<string, Set<string>>) {
    const flat = Object.entries(next).flatMap(([date, times]) =>
      [...times].map(t => `${date}T${t}`)
    );
    onChange(flat);
  }

  function toggleTime(time: string) {
    if (!selectedDay) return;
    const next = { ...slots };
    const current = new Set(next[selectedDay] ?? []);
    if (current.has(time)) current.delete(time);
    else current.add(time);
    if (current.size === 0) delete next[selectedDay];
    else next[selectedDay] = current;
    setSlots(next);
    notify(next);
  }

  function selectDay(key: string, isPast: boolean) {
    if (isPast) return;
    setSelectedDay(prev => prev === key ? null : key);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' });

  const totalSlots = Object.values(slots).reduce((acc, s) => acc + s.size, 0);

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
          <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-bold text-gray-800">{monthName} {viewYear}</span>
          <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 p-2 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const key = toKey(viewYear, viewMonth, d);
            const isPast = new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();
            const isSelected = selectedDay === key;
            const hasSlots = (slots[key]?.size ?? 0) > 0;

            return (
              <button
                key={key}
                type="button"
                onClick={() => selectDay(key, isPast)}
                disabled={isPast}
                className={`relative aspect-square rounded-xl text-sm font-semibold transition flex items-center justify-center
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                  ${isSelected ? 'bg-violet-600 text-white' : isToday ? 'border-2 border-violet-400 text-violet-700' : !isPast ? 'hover:bg-violet-50 text-gray-700' : ''}
                `}
              >
                {d}
                {hasSlots && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                )}
                {hasSlots && isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time picker for selected day */}
      {selectedDay && (
        <div className="border border-violet-200 rounded-2xl p-4 bg-violet-50">
          <p className="text-sm font-bold text-violet-700 mb-3">
            Pick times for {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {TIMES.map(({ label, value }) => {
              const active = slots[selectedDay]?.has(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleTime(value)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition ${
                    active ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {totalSlots > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-emerald-700">
            {totalSlots} interview slot{totalSlots !== 1 ? 's' : ''} selected across {Object.keys(slots).length} day{Object.keys(slots).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
