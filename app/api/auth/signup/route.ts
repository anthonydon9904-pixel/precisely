import { NextRequest, NextResponse } from 'next/server';
import { createEmployer, loginEmployer } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Email and a password of at least 6 characters are required.' }, { status: 400 });
  }
  const employer = createEmployer(email, password);
  if (!employer) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }
  const token = loginEmployer(email, password)!;
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
