import os
import pandas as pd
from datetime import date
from indices_analysis.getHistoryData import NSEIndexHistory
from indices_analysis.constants import get_total_indices
from indices_analysis.utils import assign_symbols

HISTORICAL_DATA_DIR = os.path.join(os.getcwd(), './Historical_Close')
nse = NSEIndexHistory()

def updateIndex(index,symbol):
    
    org = pd.read_csv(HISTORICAL_DATA_DIR+'/'+index+'_Data.csv')
    org['Date'] = pd.to_datetime(org['Date']).dt.date
    org.sort_values(by = "Date", inplace = True)

    start = org.iloc[-1]['Date']
  
    df = nse.index_df(symbol=symbol, from_date=start, to_date=date.today())
    for col in df.columns:
        if col != 'CLOSE' or col != 'HistoricalDate':
            df = df.drop([col],axis = 1)
      
    if(df.empty):
        print(index+' DATA NOT FOUND!\n')
        return
  
    df['HistoricalDate'] = pd.to_datetime(df['HistoricalDate']).dt.date
    df = df[df['HistoricalDate']> start]
    df.drop(['Index Name', 'INDEX_NAME'], axis = 1, inplace = True)
    df.rename(columns={'HistoricalDate': 'Date','HIGH': 'High','LOW':'Low','CLOSE': 'Close'},inplace=True, errors='raise')
    df = df.loc[::-1].reset_index(drop=True)
    
    org = org.append(df)
    org.sort_values(by = "Date", inplace = True)
    org = org.drop_duplicates(subset=['Date'], keep='first')
    org.to_csv(HISTORICAL_DATA_DIR+'/'+index+'_Data.csv',index=False)
    print(f'{index} updated sucessfully')


def updateData():
    
    Total_Indices = get_total_indices()
    symbol = assign_symbols(get_total_indices())
    for index in Total_Indices:
        updateIndex(index,symbol[index])

