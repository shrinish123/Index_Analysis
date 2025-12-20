import { NextResponse } from 'next/server';
import { INDICES } from '@/lib/constants';
import { getIndexData } from '@/lib/data-loader';

export async function GET() {
  return NextResponse.json(INDICES);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { indexName } = body;

    if (!indexName) {
      return NextResponse.json({ error: 'Index name is required' }, { status: 400 });
    }

    const data = await getIndexData(indexName);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
