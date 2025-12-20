import { format, parse, addDays, endOfMonth, isBefore, startOfMonth } from 'date-fns';
import { IndexRecord } from './types';

const BASE_URL = "https://niftyindices.com";
const INDEX_HISTORY_PATH = "/Backpage.aspx/getHistoricaldatatabletoString";

// Headers to mimic the Python requests
const HEADERS = {
  "Host": "niftyindices.com",
  "Referer": "niftyindices.com",
  "X-Requested-With": "XMLHttpRequest",
  "pragma": "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
  "Origin": "https://niftyindices.com",
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Content-Type": "application/json; charset=UTF-8"
};

function breakDates(fromDate: Date, toDate: Date): { start: Date, end: Date }[] {
  if (startOfMonth(fromDate).getTime() === startOfMonth(toDate).getTime()) {
    return [{ start: fromDate, end: toDate }];
  }

  const ranges: { start: Date, end: Date }[] = [];
  let monthStart = fromDate;
  let monthEnd = endOfMonth(monthStart);

  while (isBefore(monthEnd, toDate)) {
    ranges.push({ start: monthStart, end: monthEnd });
    monthStart = addDays(monthEnd, 1);
    monthEnd = endOfMonth(monthStart);
    
    if (monthEnd >= toDate) {
      ranges.push({ start: monthStart, end: toDate });
    }
  }
  return ranges;
}

async function fetchIndexChunk(symbol: string, startDate: Date, endDate: Date): Promise<IndexRecord[]> {
  const params = {
    name: symbol,
    startDate: format(startDate, "dd-MMM-yyyy"),
    endDate: format(endDate, "dd-MMM-yyyy")
  };

  const response = await fetch(`${BASE_URL}${INDEX_HISTORY_PATH}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const json = await response.json();
  const dataStr = json.d;
  const data = JSON.parse(dataStr);
  return data;
}

export async function getIndexHistory(symbol: string, fromDate: Date, toDate: Date): Promise<IndexRecord[]> {
  const dateRanges = breakDates(fromDate, toDate);
  // Reverse to match Python logic if needed, but usually order doesn't matter if we sort later.
  // Python code reversed it: `reversed(date_ranges)`.
  // We will fetch all and sort.
  
  const promises = dateRanges.reverse().map(range => fetchIndexChunk(symbol, range.start, range.end));
  const chunks = await Promise.all(promises);
  
  const allData = chunks.flat();
  
  // Parse and sort
  const parsedData = allData.map(item => ({
    ...item,
    Date: item.Date, // Keep original string for now or parse it?
    // The Python code parses it to np.datetime64. We should probably standardize to ISO string or Date object.
    // Let's keep it as is for now and let analysis handle it, or standardize here.
    // Actually, let's standardize to ISO string YYYY-MM-DD for easier sorting.
  }));

  // Sort by Date
  parsedData.sort((a, b) => {
    const dateA = new Date(a.Date).getTime();
    const dateB = new Date(b.Date).getTime();
    return dateA - dateB;
  });

  return parsedData;
}
