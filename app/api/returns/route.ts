import { NextResponse } from 'next/server';
import { getMultipleIndicesData } from '@/lib/data-loader';
import { calculateDivergence } from '@/lib/analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { indexName, benchmarkName } = body;

    if (!indexName || !benchmarkName) {
      return NextResponse.json({ error: 'Index name and Benchmark name are required' }, { status: 400 });
    }

    console.log(`📈 Calculating returns for ${indexName} vs ${benchmarkName}...`);

    // Update and load both indices in parallel
    const dataMap = await getMultipleIndicesData([indexName, benchmarkName], true);
    
    const indexData = dataMap.get(indexName);
    const benchmarkData = dataMap.get(benchmarkName);

    if (!indexData || !benchmarkData) {
      return NextResponse.json({ 
        error: `Failed to load data for ${!indexData ? indexName : benchmarkName}` 
      }, { status: 404 });
    }

    const divergenceData = calculateDivergence(indexData, benchmarkData);
    
    return NextResponse.json(divergenceData);
  } catch (error: any) {
    console.error('Returns API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
