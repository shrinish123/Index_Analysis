import { format } from 'date-fns';
import { IndexRecord } from './types';
import { getNSEApiName } from './index-name-mapping';

// API response format from NSE
interface NSEApiRecord {
  HistoricalDate: string;
  INDEX_NAME: string;
  DT: string;
  OPEN: string;
  HIGH: string;
  LOW: string;
  CLOSE: string;
  TURNOVER: string;
  VOL: string;
}

const BASE_URL = "https://niftyindices.com";
const INDEX_HISTORY_PATH = "/Backpage.aspx/getHistoricaldataDBtoString";

// Headers to mimic browser requests
const HEADERS = {
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  "Connection": "keep-alive",
  "Content-Type": "application/json; charset=UTF-8",
  "Origin": "https://niftyindices.com",
  "Referer": "https://niftyindices.com/",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
  "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"'
};


async function fetchIndexChunk(symbol: string, startDate: Date, endDate: Date): Promise<IndexRecord[]> {
  // Convert internal name to NSE API name
  const nseApiName = getNSEApiName(symbol);
  
  // Create the cinfo object as a string (nested JSON format required by API)
  const cinfoObj = {
    name: nseApiName,  // Use NSE API name
    startDate: format(startDate, "dd-MMM-yyyy"),
    endDate: format(endDate, "dd-MMM-yyyy"),
    historicaltype: "2",  // Historical data type
    DataType: "HR"        // High-resolution data
  };
  
  // Convert to string with single quotes (API expects this format)
  const cinfoString = JSON.stringify(cinfoObj).replace(/"/g, "'");
  
  const params = {
    cinfo: cinfoString
  };

  const response = await fetch(`${BASE_URL}${INDEX_HISTORY_PATH}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(params),
    credentials: 'include'  // Include cookies
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch data (${response.status}): ${response.statusText}. Body: ${errorText.substring(0, 200)}`);
  }

  const json = await response.json();
  
  if (!json.d) {
    throw new Error(`Invalid response format: ${JSON.stringify(json).substring(0, 200)}`);
  }
  
  let dataStr = json.d;
  
  // Clean up the response - the API returns a number on first line, then JSON array
  // Example: "6.3\n[{...}]"
  dataStr = dataStr.trim();
  
  // Find the start of the JSON array (skip the number prefix)
  const jsonStart = dataStr.indexOf('[');
  if (jsonStart > 0) {
    dataStr = dataStr.substring(jsonStart);
  }
  
  let rawData: NSEApiRecord[];
  try {
    rawData = JSON.parse(dataStr) as NSEApiRecord[];
  } catch (parseError) {
    console.error(`JSON Parse Error: ${parseError}`);
    console.error(`Response data (first 500 chars): ${dataStr.substring(0, 500)}`);
    throw new Error(`Failed to parse API response: ${parseError}`);
  }
  
  // Map API response to our IndexRecord format
  const mappedData: IndexRecord[] = rawData.map((item) => ({
    Date: item.DT ? item.DT.split('T')[0] : item.HistoricalDate, // Use DT field, extract date part (yyyy-MM-dd)
    Open: parseFloat(item.OPEN || '0'),
    High: parseFloat(item.HIGH || '0'),
    Low: parseFloat(item.LOW || '0'),
    Close: parseFloat(item.CLOSE || '0'),
    SharesTraded: parseInt(item.VOL || '0'),
    Turnover: parseFloat(item.TURNOVER || '0')
  }));
  
  return mappedData;
}

export async function getIndexHistory(symbol: string, fromDate: Date, toDate: Date): Promise<IndexRecord[]> {
  // Single API call for the entire date range
  const data = await fetchIndexChunk(symbol, fromDate, toDate);
  
  // Sort by Date
  data.sort((a, b) => {
    const dateA = new Date(a.Date).getTime();
    const dateB = new Date(b.Date).getTime();
    return dateA - dateB;
  });

  return data;
}
