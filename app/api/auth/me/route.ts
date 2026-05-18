import { NextRequest, NextResponse } from 'next/server';
import { getEmployerFromToken } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return NextResponse.json(null);
  const employer = getEmployerFromToken(token);
  if (!employer) return NextResponse.json(null);
  return NextResponse.json({ id: employer.id, email: employer.email });
}
