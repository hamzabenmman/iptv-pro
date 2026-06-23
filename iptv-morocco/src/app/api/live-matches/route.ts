import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://www.scorebat.com/video-api/v3/', {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Unable to fetch live matches' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Live match feed unavailable' }, { status: 500 });
  }
}
