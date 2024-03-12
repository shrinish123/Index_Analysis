def assign_symbols(Total_Indices):
    symbol = dict()
    for index in Total_Indices:
        symbol[index] = index

    symbol['NIFTY SMALLCAP 50'] = 'NIFTY SMLCAP 50'
    symbol['NIFTY SMALLCAP 100'] = 'NIFTY SMLCAP 100'
    symbol['NIFTY SMALLCAP 250'] = 'NIFTY SMLCAP 250'
    symbol['NIFTY TOTAL MARKET'] = 'NIFTY TOTAL MKT'
    symbol['NIFTY LARGEMIDCAP 250'] = 'NIFTY LARGEMID250'
    symbol['NIFTY MIDSMALLCAP 400'] = 'NIFTY MIDSML 400'
    symbol['NIFTY MICROCAP 250'] = 'NIFTY MICROCAP250'
    symbol['NIFTY500 MULTICAP 50_25_25'] = 'NIFTY500 MULTICAP'
    symbol['NIFTY MIDCAP SELECT'] = 'NIFTY MID SELECT'
    symbol['NIFTY FINANCIAL SERVICES'] = 'NIFTY FIN SERVICE'
    symbol['NIFTY PRIVATE BANK'] = 'NIFTY PVT BANK'
    symbol['NIFTY INFRASTRUCTURE'] = 'NIFTY INFRA'
    symbol['NIFTY INFRASTRUCTURE'] = 'NIFTY INFRA'
    symbol['NIFTY100 LIQUID 15'] = 'NIFTY100 LIQ 15'
    symbol['NIFTY MIDCAP LIQUID 15'] = 'NIFTY MID LIQ 15'
    symbol['NIFTY INDIA MANUFACTURING'] = 'NIFTY INDIA MFG'
    symbol['NIFTY INDIA  DIGITAL'] = 'NIFTY IND DIGITAL'
    symbol['NIFTY GROWTH SECTORS 15'] = 'NIFTY GROWSECT 15'
    symbol['NIFTY100 QUALITY 30'] = 'NIFTYQUALTY30'
    symbol['NIFTY50 EQUAL WEIGHT'] = 'NIFTY50 EQL WGT'
    symbol['NIFTY100 EQUAL WEIGHT'] = 'NIFTY100 EQL WGT'
    symbol['NIFTY100 LOW VOLATILITY 30'] = 'NIFTY100 LOWVOL30'
    symbol['NIFTY MIDCAP150 QUALITY 50'] = 'NIFTY M150 QLTY50'
    symbol['NIFTY200 MOMENTUM 30'] = 'NIFTY200MOMENTM30'
    
    return symbol

