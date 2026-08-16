import { NextResponse } from 'next/server';
import { getEntriesByDate, getAllDates } from '@/lib/data';

export const dynamic = 'force-static';

type Props = {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { year, month, day } = await params;
    const entries = getEntriesByDate(year, month, day);

    if (entries.length === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function generateStaticParams() {
  const dates = getAllDates();
  return dates.map(({ year, month, day }) => ({
    year,
    month,
    day,
  }));
}
