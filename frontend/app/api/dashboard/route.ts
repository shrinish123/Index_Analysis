import { NextResponse } from 'next/server';
import { getIndexData } from '@/lib/data-loader';
import { calculateDivergence } from '@/lib/analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { indices, isBroad } = body;

    if (!indices || !Array.isArray(indices)) {
      return NextResponse.json({ error: 'Indices array is required' }, { status: 400 });
    }

    // 1. Load all data
    const dataMap = new Map();
    const loadPromises = indices.map(async (name: string) => {
      try {
        const data = await getIndexData(name);
        dataMap.set(name, data);
      } catch (e) {
        console.error(`Failed to load data for ${name}`, e);
      }
    });
    
    // Also load NIFTY 50 if needed
    if (!isBroad && !indices.includes('NIFTY 50')) {
        loadPromises.push((async () => {
            try {
                const data = await getIndexData('NIFTY 50');
                dataMap.set('NIFTY 50', data);
            } catch (e) {
                console.error(`Failed to load data for NIFTY 50`, e);
            }
        })());
    }

    await Promise.all(loadPromises);

    // 2. Calculate comparisons
    const rows: any[] = [];
    const oneYear: number[] = [];
    const threeYear: number[] = [];
    const fiveYear: number[] = [];
    const headers: string[] = [];

    // Pairwise comparisons
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const idx1 = indices[i];
        const idx2 = indices[j];
        const header = `${idx2} vs ${idx1}`;
        headers.push(header);

        const d1 = dataMap.get(idx1);
        const d2 = dataMap.get(idx2);

        if (d1 && d2) {
          const div = calculateDivergence(d2, d1); // idx2 vs idx1 (benchmark)
          // Get last value - USE Z-SCORE for Dashboard
          const last1 = div[1].length > 0 ? div[1][div[1].length - 1].zScore : null;
          const last3 = div[3].length > 0 ? div[3][div[3].length - 1].zScore : null;
          const last5 = div[5].length > 0 ? div[5][div[5].length - 1].zScore : null;
          
          oneYear.push(last1 !== null ? last1 : NaN);
          threeYear.push(last3 !== null ? last3 : NaN);
          fiveYear.push(last5 !== null ? last5 : NaN);
        } else {
            oneYear.push(NaN);
            threeYear.push(NaN);
            fiveYear.push(NaN);
        }
      }
    }

    // NIFTY 50 comparisons (if not broad)
    if (!isBroad) {
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        const header = `NIFTY 50 vs ${idx}`;
        headers.push(header);

        const dIndex = dataMap.get(idx);
        const dNifty = dataMap.get('NIFTY 50');

        if (dIndex && dNifty) {
           const div = calculateDivergence(dNifty, dIndex); // NIFTY 50 vs Index
           
           // USE Z-SCORE for Dashboard
           const last1 = div[1].length > 0 ? div[1][div[1].length - 1].zScore : null;
           const last3 = div[3].length > 0 ? div[3][div[3].length - 1].zScore : null;
           const last5 = div[5].length > 0 ? div[5][div[5].length - 1].zScore : null;

           oneYear.push(last1 !== null ? last1 : NaN);
           threeYear.push(last3 !== null ? last3 : NaN);
           fiveYear.push(last5 !== null ? last5 : NaN);
        } else {
            oneYear.push(NaN);
            threeYear.push(NaN);
            fiveYear.push(NaN);
        }
      }
    }

    // Construct response format suitable for table
    // Python returns: { comparable: headers, "1 year": one_year, ... }
    // We can return array of objects: { comparison: string, year1: number, year3: number, year5: number }
    
    const result = headers.map((h, i) => ({
      comparison: h,
      year1: oneYear[i],
      year3: threeYear[i],
      year5: fiveYear[i]
    }));

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
