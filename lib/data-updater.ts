import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { format, parse, addDays, isBefore, startOfDay } from 'date-fns';
import { IndexRecord } from './types';
import { getIndexHistory } from './nifty-client';

const DATA_DIR = path.join(process.cwd(), 'Historical_Close');

// Helper to get CSV file path
function getCSVPath(indexName: string): string {
  return path.join(DATA_DIR, `${indexName}_Data.csv`);
}

// Helper to parse date from CSV (yyyy-MM-dd format)
function parseCSVDate(dateStr: string): Date | null {
  try {
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isNaN(parsed.getTime())) {
      return startOfDay(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

// Get the last date from a CSV file
export async function getLastDateFromCSV(indexName: string): Promise<Date | null> {
  const filePath = getCSVPath(indexName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`No CSV file found for ${indexName}, will create new one`);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const data = results.data as Record<string, string>[];
    
    if (data.length === 0) {
      return null;
    }

    // Find the last valid date
    let lastDate: Date | null = null;
    
    for (let i = data.length - 1; i >= 0; i--) {
      const row = data[i];
      if (row.Date) {
        const parsed = parseCSVDate(row.Date);
        if (parsed) {
          lastDate = parsed;
          break;
        }
      }
    }

    return lastDate;
  } catch (error) {
    console.error(`Error reading CSV for ${indexName}:`, error);
    return null;
  }
}

// Append new records to CSV file (removes duplicates)
export async function appendToCSV(indexName: string, newRecords: IndexRecord[]): Promise<void> {
  if (newRecords.length === 0) {
    return;
  }

  const filePath = getCSVPath(indexName);
  
  // Check if file exists
  const fileExists = fs.existsSync(filePath);
  
  if (fileExists) {
    // Read existing file to check for duplicates
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    const existingData = results.data as Record<string, string>[];
    const existingDates = new Set(existingData.map(row => row.Date));
    
    // Filter out dates that already exist
    const uniqueNewRecords = newRecords.filter(record => !existingDates.has(record.Date));
    
    if (uniqueNewRecords.length === 0) {
      console.log(`✅ ${indexName}: No new records (all dates already exist)`);
      return;
    }
    
    // Convert only unique records to CSV format
    const csvData = Papa.unparse(uniqueNewRecords, {
      header: false,
      columns: ['Date', 'Open', 'High', 'Low', 'Close', 'SharesTraded', 'Turnover'],
    });
    
    // Append to existing file
    fs.appendFileSync(filePath, '\n' + csvData);
    console.log(`✅ Updated ${indexName}: Added ${uniqueNewRecords.length} new records (skipped ${newRecords.length - uniqueNewRecords.length} duplicates)`);
  } else {
    // Create new file - no duplicates possible
    const csvData = Papa.unparse(newRecords, {
      header: true,
      columns: ['Date', 'Open', 'High', 'Low', 'Close', 'SharesTraded', 'Turnover'],
    });
    
    fs.writeFileSync(filePath, csvData);
    console.log(`✅ Created ${indexName}: Added ${newRecords.length} records`);
  }
}

// Update a single index with missing data
export async function updateIndexData(indexName: string): Promise<{ updated: boolean; recordsAdded: number }> {
  try {
    // Skip non-NSE indices as they don't have the same API
    const { isNSEIndex } = await import('./index-name-mapping');
    if (!isNSEIndex(indexName)) {
      console.log(`⏭️  Skipping ${indexName} (external index)`);
      return { updated: false, recordsAdded: 0 };
    }

    console.log(`🔍 Checking ${indexName}...`);
    
    // Get last date from CSV
    const lastDate = await getLastDateFromCSV(indexName);
    const today = startOfDay(new Date());
    
    if (!lastDate) {
      console.log(`⚠️  No data found for ${indexName}, may need full historical fetch`);
      return { updated: false, recordsAdded: 0 };
    }
    
    // Calculate the start date for fetching (day after last date)
    const fetchFromDate = addDays(lastDate, 1);
    console.log({lastDate, today, fetchFromDate})
    
    // Check if we need to update
    if (!isBefore(fetchFromDate, today)) {
      console.log(`✓ ${indexName} is up to date (last date: ${format(lastDate, 'yyyy-MM-dd')})`);
      return { updated: false, recordsAdded: 0 };
    }
    
    console.log(`Fetching ${indexName} from ${format(fetchFromDate, 'yyyy-MM-dd')} to ${format(today, 'yyyy-MM-dd')}`);
    
    // Fetch missing data from API
    const newData = await getIndexHistory(indexName, fetchFromDate, today);
    
    if (newData.length === 0) {
      console.log(`No new data available for ${indexName}`);
      return { updated: false, recordsAdded: 0 };
    }
    
    // Format records for CSV (ensure proper date format)
    const formattedRecords: IndexRecord[] = newData.map(record => ({
      Date: record.Date, // Keep original format from API
      Open: record.Open,
      High: record.High,
      Low: record.Low,
      Close: record.Close,
      SharesTraded: record.SharesTraded || 0,
      Turnover: record.Turnover || 0,
    }));
    
    // Append to CSV
    await appendToCSV(indexName, formattedRecords);
    
    return { updated: true, recordsAdded: formattedRecords.length };
    
  } catch (error) {
    const err = error as Error;
    console.error(`Error updating ${indexName}:`, err.message);
    return { updated: false, recordsAdded: 0 };
  }
}

// Update multiple indices in parallel
export async function updateAllIndices(indexNames: string[]): Promise<Map<string, { updated: boolean; recordsAdded: number }>> {
  console.log(`\n🔄 Starting parallel update for ${indexNames.length} indices...\n`);
  
  const startTime = Date.now();
  
  // Update all indices in parallel using Promise.all
  const updatePromises = indexNames.map(async (indexName) => {
    const result = await updateIndexData(indexName);
    return { indexName, result };
  });
  
  const results = await Promise.all(updatePromises);
  
  // Convert to Map for easy lookup
  const resultMap = new Map<string, { updated: boolean; recordsAdded: number }>();
  let totalUpdated = 0;
  let totalRecords = 0;
  
  results.forEach(({ indexName, result }) => {
    resultMap.set(indexName, result);
    if (result.updated) {
      totalUpdated++;
      totalRecords += result.recordsAdded;
    }
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Update complete! ${totalUpdated}/${indexNames.length} indices updated with ${totalRecords} total records in ${duration}s\n`);
  
  return resultMap;
}

// Check if update is needed for any index
export async function needsUpdate(indexNames: string[]): Promise<boolean> {
  const today = startOfDay(new Date());
  
  for (const indexName of indexNames) {
    const lastDate = await getLastDateFromCSV(indexName);
    if (!lastDate || isBefore(lastDate, today)) {
      return true;
    }
  }
  
  return false;
}

