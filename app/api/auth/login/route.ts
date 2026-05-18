import { NextRequest, NextResponse } from 'next/server';
import { loginEmployer } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const token = loginEmployer(email, password);
  if (!token) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
