import { NextResponse } from 'next/server';
import { getIndexData } from '@/lib/data-loader';
import { calculateDivergence } from '@/lib/analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { indexName, benchmarkName } = body;

    if (!indexName || !benchmarkName) {
      return NextResponse.json({ error: 'Index name and Benchmark name are required' }, { status: 400 });
    }

    const indexData = await getIndexData(indexName);
    const benchmarkData = await getIndexData(benchmarkName);

    const divergenceData = calculateDivergence(indexData, benchmarkData);
    
    return NextResponse.json(divergenceData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
