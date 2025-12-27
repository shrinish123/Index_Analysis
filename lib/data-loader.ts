import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { IndexRecord } from './types';
import { updateIndexData, updateAllIndices } from './data-updater';

const DATA_DIRS = [
  path.join(process.cwd(), 'data'), // Netlify / Production (if copied)
  path.join(process.cwd(), 'public', 'data'), // Alternative
  path.join(process.cwd(), 'Historical_Close'), // Local Development (Root)
  path.join(process.cwd(), '..', 'Historical_Close') // Fallback
];

export async function getIndexData(indexName: string, skipUpdate: boolean = false): Promise<IndexRecord[]> {
  // First, try to update the data with latest records (unless skipped)
  if (!skipUpdate) {
    try {
      await updateIndexData(indexName);
    } catch (error) {
      console.warn(`Failed to update ${indexName}, proceeding with existing data:`, error);
    }
  }
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

  const data = results.data as Record<string, string | number>[];

  // Map and clean data
  const cleanedData: IndexRecord[] = data.map(row => {
    // Handle date parsing if needed, but CSV usually has standard format.
    // Python code: pd.to_datetime(Index['Date']).dt.date
    // We'll keep it as string for now, but ensure it's consistent.
    return {
      Date: String(row.Date),
      Open: Number(row.Open),
      High: Number(row.High),
      Low: Number(row.Low),
      Close: Number(row.Close),
      SharesTraded: Number(row['Shares Traded']) || 0,
      Turnover: Number(row['Turnover (₹ Cr)']) || 0
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

// Load multiple indices with parallel update
export async function getMultipleIndicesData(
  indexNames: string[], 
  updateFirst: boolean = true
): Promise<Map<string, IndexRecord[]>> {
  const dataMap = new Map<string, IndexRecord[]>();
  
  // If updateFirst, update all indices in parallel first
  if (updateFirst) {
    try {
      await updateAllIndices(indexNames);
    } catch (error) {
      console.warn('Failed to update some indices, proceeding with existing data:', error);
    }
  }
  
  // Now load all data in parallel
  const loadPromises = indexNames.map(async (indexName) => {
    try {
      // Skip update since we already did it above
      const data = await getIndexData(indexName, true);
      return { indexName, data };
    } catch (error) {
      console.error(`Failed to load ${indexName}:`, error);
      return { indexName, data: null };
    }
  });
  
  const results = await Promise.all(loadPromises);
  
  results.forEach(({ indexName, data }) => {
    if (data) {
      dataMap.set(indexName, data);
    }
  });
  
  return dataMap;
}
