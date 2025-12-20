import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { IndexRecord } from './types';

const DATA_DIRS = [
  path.join(process.cwd(), 'data'), // Netlify / Production (if copied)
  path.join(process.cwd(), 'public', 'data'), // Alternative
  path.join(process.cwd(), 'Historical_Close'), // Local Development (Root)
  path.join(process.cwd(), '..', 'Historical_Close') // Fallback
];

export async function getIndexData(indexName: string): Promise<IndexRecord[]> {
  let filePath = '';
  
  for (const dir of DATA_DIRS) {
    const p = path.join(dir, `${indexName}_Data.csv`);
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }
  
  if (!filePath) {
    console.error(`Data file for ${indexName} not found in:`, DATA_DIRS);
    throw new Error(`Data file for ${indexName} not found.`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  const results = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const data = results.data as any[];

  // Map and clean data
  const cleanedData: IndexRecord[] = data.map(row => {
    // Handle date parsing if needed, but CSV usually has standard format.
    // Python code: pd.to_datetime(Index['Date']).dt.date
    // We'll keep it as string for now, but ensure it's consistent.
    return {
      Date: row.Date,
      Open: row.Open,
      High: row.High,
      Low: row.Low,
      Close: row.Close,
      SharesTraded: row['Shares Traded'] || 0,
      Turnover: row['Turnover (₹ Cr)'] || 0
    };
  }).filter(d => d.Date && d.Close); // Filter invalid rows

  // Sort by Date
  cleanedData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

  // Remove duplicates (keep first) - Python: drop_duplicates(subset='Date', keep="first")
  const uniqueData: IndexRecord[] = [];
  const seenDates = new Set();
  
  for (const item of cleanedData) {
    if (!seenDates.has(item.Date)) {
      seenDates.add(item.Date);
      uniqueData.push(item);
    }
  }

  return uniqueData;
}
