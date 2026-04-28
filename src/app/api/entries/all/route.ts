import { NextResponse } from 'next/server';
import { getAllEntries } from '@/lib/data';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const entries = getAllEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
