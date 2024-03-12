import pandas as pd
import numpy as np
from urllib.parse import urljoin
from requests import Session
import itertools
import json
from datetime import datetime,timedelta
from concurrent.futures import ThreadPoolExecutor
import calendar
        
class NSEIndexHistory:
    def __init__(self):
        super().__init__()
        self.headers = {
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
            }
        self.path_map = {
            "index_history": "/Backpage.aspx/getHistoricaldatatabletoString",
            "index_pe_history": "/Backpage.aspx/getpepbHistoricaldataDBtoString"
        }
        self.base_url = "https://niftyindices.com"
        self.show_progress = False
        
        self.s = Session()
        self.s.headers.update(self.headers)
        self.ssl_verify = True
        
    def break_dates(self,from_date, to_date):
        if from_date.replace(day=1) == to_date.replace(day=1):
            return [(from_date, to_date)]
        date_ranges = []
        month_start = from_date
        month_end = month_start.replace(day=calendar.monthrange(month_start.year, from_date.month)[1])
        while(month_end < to_date):
            date_ranges.append((month_start, month_end))
            month_start = month_end + timedelta(days=1)
            month_end = month_start.replace(day=calendar.monthrange(month_start.year, month_start.month)[1])
            if month_end >= to_date:
                date_ranges.append((month_start, to_date))
        return date_ranges
    
    def np_float(self,num):
        try:
            return np.float64(num)
        except ValueError:
            return np.nan
    
    def np_date(self,dt):
        try:
            return np.datetime64(dt)
        except ValueError:
            pass

        try:
            dt = datetime.strptime(dt, "%d-%b-%Y").date()
            return np.datetime64(dt)
        except ValueError:
            pass

        try:
            dt = datetime.strptime(dt, "%d %b %Y").date()
            return np.datetime64(dt)
        except ValueError:
            pass

        return np.datetime64('nat') 

    def _post_json(self, path_name, params):
        path = self.path_map[path_name]
        url = urljoin(self.base_url, path)
        self.r = self.s.post(url, json=params, verify=self.ssl_verify)
        return self.r
    
    def pool(self,function, params):
        
        with ThreadPoolExecutor(max_workers=2) as ex:
            dfs = ex.map(function, *zip(*params))
        
        return dfs

    
    def _index(self, symbol, from_date, to_date): 
        params = {'name': symbol,
                'startDate': from_date.strftime("%d-%b-%Y"),
                'endDate': to_date.strftime("%d-%b-%Y")
        }
        r = self._post_json("index_history", params=params)
        return json.loads(r.json()['d'])
    
    def index_raw(self, symbol, from_date, to_date):
        date_ranges = self.break_dates(from_date, to_date)
        params = [(symbol, x[0], x[1]) for x in reversed(date_ranges)]
        chunks = self.pool(self._index, params)
        return list(itertools.chain.from_iterable(chunks))
        
    def index_df(self,symbol, from_date, to_date):
   
        raw = self.index_raw(symbol, from_date, to_date)
        df = pd.DataFrame(raw)
        
        if not df.empty:
            index_dtypes = {'CLOSE': self.np_float,
                        'Index Name': str, 'INDEX_NAME': str, 'HistoricalDate': self.np_date}
            for col, dtype in index_dtypes.items():
                df[col] = df[col].apply(dtype)
                
        return df
    



