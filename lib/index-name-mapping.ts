/**
 * Mapping from our internal index names to NSE API index names
 * 
 * NSE API uses format: "Nifty 50", "Nifty Bank" (capital N, lowercase rest, with spaces)
 * Our internal names use: "NIFTY 50", "NIFTY BANK" (all caps, with spaces or underscores)
 */
export const INDEX_NAME_MAP: Record<string, string> = {
  // Main Broad Indices
  "NIFTY 50": "Nifty 50",
  "NIFTY 100": "Nifty 100",
  "NIFTY 200": "Nifty 200",
  "NIFTY 500": "Nifty 500",
  "NIFTY NEXT 50": "Nifty Next 50",
  "NIFTY TOTAL MARKET": "NIFTY TOTAL MKT",
  
  // Sectoral Indices
  "NIFTY AUTO": "Nifty Auto",
  "NIFTY BANK": "Nifty Bank",
  "NIFTY COMMODITIES": "Nifty Commodities",
  "NIFTY CPSE": "Nifty CPSE",
  "NIFTY ENERGY": "Nifty Energy",
  "NIFTY FINANCIAL SERVICES": "Nifty Financial Services",
  "NIFTY FMCG": "Nifty FMCG",
  "NIFTY HEALTHCARE": "Nifty Healthcare Index",
  "NIFTY INFRASTRUCTURE": "Nifty Infra",
  "NIFTY IT": "Nifty IT",
  "NIFTY MEDIA": "Nifty Media",
  "NIFTY METAL": "Nifty Metal",
  "NIFTY MNC": "Nifty MNC",
  "NIFTY PHARMA": "Nifty Pharma",
  "NIFTY PRIVATE BANK": "Nifty Pvt Bank",
  "NIFTY PSE": "Nifty PSE",
  "NIFTY PSU BANK": "Nifty PSU Bank",
  "NIFTY REALTY": "Nifty Realty",
  "NIFTY REITS _ INVITS": "Nifty REITs & InvITs",
  
  // Thematic Indices
  "NIFTY GROWTH SECTORS 15": "Nifty GrowSect 15",
  "NIFTY INDIA DIGITAL": "NIFTY IND DIGITAL",
  "NIFTY INDIA MANUFACTURING": "NIFTY INDIA MFG",
  
  // Strategy Indices (Alpha)
  "NIFTY ALPHA 50": "Nifty Alpha 50",
  "NIFTY ALPHA LOW-VOLATILITY 30": "Nifty Alpha Low-Volatility 30",
  "NIFTY ALPHA QUALITY LOW-VOLATILITY 30": "Nifty AQL 30",
  "NIFTY ALPHA QUALITY VALUE LOW-VOLATILITY 30": "Nifty Alpha Quality Value Low-Volatility 30",
  
  // Smart Beta Indices
  "NIFTY HIGH BETA 50": "Nifty High Beta 50",
  "NIFTY LOW VOLATILITY 50": "Nifty Low Volatility 50",
  "NIFTY QUALITY LOW-VOLATILITY 30": "Nifty Quality Low-Volatility 30",
  
  // Nifty 50 Based
  "NIFTY50 EQUAL WEIGHT": "NIFTY50 EQL WGT",
  "NIFTY50 VALUE 20": "Nifty50 Value 20",
  
  // Nifty 100 Based
  "NIFTY100 ALPHA 30": "Nifty100 Alpha 30",
  "NIFTY100 ENHANCED ESG": "Nifty100 Enhanced ESG",
  "NIFTY100 EQUAL WEIGHT": "NIFTY100 EQL WGT",
  "NIFTY100 ESG": "Nifty100 ESG",
  "NIFTY100 LIQUID 15": "Nifty100 Liq 15",
  "NIFTY100 LOW VOLATILITY 30": "NIFTY100 LOWVOL30",
  "NIFTY100 QUALITY 30": "NIFTY100 QUALTY30",
  
  // Nifty 200 Based
  "NIFTY200 ALPHA 30": "Nifty200 Alpha 30",
  "NIFTY200 MOMENTUM 30": "Nifty200Momentm30",
  "NIFTY200 QUALITY 30": "NIFTY200 QUALITY 30",
  
  // Nifty 500 Based
  "NIFTY500 MULTICAP 50_25_25": "NIFTY500 MULTICAP",
  "NIFTY500 VALUE 50": "Nifty500 Value 50",
  
  // Midcap Indices
  "NIFTY MIDCAP 50": "Nifty Midcap 50",
  "NIFTY MIDCAP 100": "Nifty Midcap 100",
  "NIFTY MIDCAP 150": "Nifty Midcap 150",
  "NIFTY MIDCAP LIQUID 15": "Nifty Mid Liq 15",
  "NIFTY MIDCAP SELECT": "NIFTY MID SELECT",
  "NIFTY MIDCAP150 MOMENTUM 50": "Nifty Midcap150 Momentum 50",
  "NIFTY MIDCAP150 QUALITY 50": "Nifty Midcap150 Quality 50",
  "NIFTY LARGEMIDCAP 250": "NIFTY LARGEMID250",
  
  // Smallcap Indices
  "NIFTY SMALLCAP 50": "Nifty Smallcap 50",
  "NIFTY SMALLCAP 100": "NIFTY SMLCAP 100",
  "NIFTY SMALLCAP 250": "Nifty Smallcap 250",
  "NIFTY SMALLCAP250 QUALITY 50": "Nifty Smallcap250 Quality 50",
  
  // MidSmallcap
  "NIFTY MIDSMALLCAP 400": "Nifty MidSmallcap 400",
  "NIFTY MIDSMALL FINANCIAL SERVICES": "Nifty Midsmall Financial Services",
  "NIFTY MIDSMALL HEALTHCARE": "NIFTY MIDSML HLTH",
  "NIFTY MIDSMALL INDIA CONSUMPTION": "Nifty Midsmall India Consumption",
  
  // Microcap
  "NIFTY MICROCAP 250": "NIFTY MICROCAP250",
  
  // External Indices (not supported by NSE API)
  "DJIA": "DJIA", // Not supported
  "NASDAQ": "NASDAQ", // Not supported
  "S_P500": "S&P 500", // Not supported
  "NKI": "NKI", // Not supported
  "SENSEX": "SENSEX", // Not supported (BSE index)
};

/**
 * Get the NSE API name for an index
 * @param internalName - Our internal index name
 * @returns The NSE API name, or the original name if not found
 */
export function getNSEApiName(internalName: string): string {
  return INDEX_NAME_MAP[internalName] || internalName;
}

/**
 * Check if an index is supported by NSE API
 */
export function isNSEIndex(internalName: string): boolean {
  const nonNSEIndices = ['DJIA', 'NASDAQ', 'S_P500', 'NKI', 'SENSEX'];
  return !nonNSEIndices.includes(internalName);
}

