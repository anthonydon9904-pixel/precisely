import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (token) deleteSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', '', { maxAge: 0, path: '/' });
  return res;
}
