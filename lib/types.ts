export interface IndexRecord {
  Date: string; // "dd-MMM-yyyy" or ISO
  Open: number;
  High: number;
  Low: number;
  Close: number;
  SharesTraded: number;
  Turnover: number;
}

export interface IndexData {
  name: string;
  data: IndexRecord[];
}

export interface ReturnData {
  date: string;
  value: number;
}

export interface DivergenceData {
  date: string;
  divergence: number; // Raw divergence
  zScore: number;     // Standardized divergence
  mean: number;
  std: number;
  plus1SD: number;
  minus1SD: number;
  plus2SD: number;
  minus2SD: number;
}
