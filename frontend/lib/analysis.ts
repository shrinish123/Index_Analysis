import { IndexRecord, DivergenceData } from './types';
import * as ss from 'simple-statistics';

// Helper to calculate log returns
function calculateLogReturns(data: number[], lag: number): (number | null)[] {
  return data.map((val, i) => {
    if (i < lag) return null;
    const prev = data[i - lag];
    if (prev === 0) return null; // Avoid division by zero
    return Math.log(val / prev);
  });
}

// Helper to merge two datasets on Date
function mergeData(indexData: IndexRecord[], benchmarkData: IndexRecord[]) {
  const benchmarkMap = new Map(benchmarkData.map(item => [item.Date, item]));
  const merged = [];

  for (const item of indexData) {
    const benchmarkItem = benchmarkMap.get(item.Date);
    if (benchmarkItem) {
      merged.push({
        Date: item.Date,
        IndexClose: item.Close,
        BenchmarkClose: benchmarkItem.Close
      });
    }
  }
  return merged;
}

export function calculateReturns(data: IndexRecord[]) {
  const closes = data.map(d => d.Close);
  const daily = calculateLogReturns(closes, 1);
  const year1 = calculateLogReturns(closes, 252);
  const year3 = calculateLogReturns(closes, 756);
  const year5 = calculateLogReturns(closes, 1260);

  return data.map((d, i) => ({
    Date: d.Date,
    Close: d.Close,
    DailyReturn: daily[i],
    Year1Return: year1[i],
    Year3Return: year3[i],
    Year5Return: year5[i]
  }));
}

export function calculateDivergence(indexData: IndexRecord[], benchmarkData: IndexRecord[], years: number[] = [1, 3, 5]) {
  // 1. Calculate returns for both
  const indexReturns = calculateReturns(indexData);
  const benchmarkReturns = calculateReturns(benchmarkData);

  // 2. Merge on Date
  const merged = [];
  const indexMap = new Map(indexReturns.map(i => [i.Date, i]));
  
  for (const b of benchmarkReturns) {
    const i = indexMap.get(b.Date);
    if (i) {
      merged.push({
        Date: b.Date,
        Index: i,
        Benchmark: b
      });
    }
  }

  const results: Record<number, DivergenceData[]> = {};

  for (const year of years) {
    const divergenceSeries: DivergenceData[] = [];
    const diffs: number[] = [];

    // Calculate raw divergence first to get mean/std
    const rawDivergences = merged.map(m => {
      const iRet = year === 1 ? m.Index.Year1Return : year === 3 ? m.Index.Year3Return : m.Index.Year5Return;
      const bRet = year === 1 ? m.Benchmark.Year1Return : year === 3 ? m.Benchmark.Year3Return : m.Benchmark.Year5Return;
      
      if (iRet !== null && bRet !== null) {
        return iRet - bRet;
      }
      return null;
    }).filter(d => d !== null) as number[];

    if (rawDivergences.length === 0) {
      results[year] = [];
      continue;
    }

    const mean = ss.mean(rawDivergences);
    const std = ss.standardDeviation(rawDivergences);

    merged.forEach(m => {
      const iRet = year === 1 ? m.Index.Year1Return : year === 3 ? m.Index.Year3Return : m.Index.Year5Return;
      const bRet = year === 1 ? m.Benchmark.Year1Return : year === 3 ? m.Benchmark.Year3Return : m.Benchmark.Year5Return;

      if (iRet !== null && bRet !== null) {
        const diff = iRet - bRet;
        const zScore = std !== 0 ? (diff - mean) / std : 0;
        
        divergenceSeries.push({
          date: m.Date,
          divergence: diff,
          zScore: zScore,
          mean: mean,
          std: std,
          plus1SD: mean + std,
          minus1SD: mean - std,
          plus2SD: mean + 2 * std,
          minus2SD: mean - 2 * std
        });
      }
    });

    results[year] = divergenceSeries;
  }

  return results;
}
