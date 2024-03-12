import os 
import pandas as pd 
from dash import html,dash_table
from collections import OrderedDict
import dash_bootstrap_components as dbc
from indices_analysis.compare_nifty_indices_return_divergence import getLastDeviation


def get_all_indices():
    
    HISTORICAL_FOLDER_PATH = os.path.join(os.path.dirname(__file__), '..', 'Historical_Close')
    file_list = []
    
    for filename in os.listdir(HISTORICAL_FOLDER_PATH):
        file_list.append(filename[:-9])

    return file_list


def get_headers(index):
    index_headers = []
    for i in range(len(index)):
        for j in range(i+1,len(index)):
            index_headers.append(f'{index[j]} vs {index[i]}')

    return index_headers

def get_headers_with_nifty(index,headers):
    
    for i in range(len(index)):
        headers.append(f'NIFTY 50 vs {index[i]}')
    
    return headers

def calc_deviations(benchmark,index,one_year,three_year,five_year):
    deviations = getLastDeviation(index,benchmark)
    one_year.append(deviations[0])
    three_year.append(deviations[1])
    five_year.append(deviations[2])

def get_year_returns(index,is_broad,one_year,three_year,five_year):
    
    for i in range(len(index)):
        for j in range(i+1,len(index)):
           calc_deviations(index[i],index[j],one_year,three_year,five_year)
    
    if not is_broad: 
        for i in range(len(index)):
            calc_deviations(index[i],'NIFTY 50',one_year,three_year,five_year)
   

# Build the Table 
def build_table(index,is_broad=False):
    
    headers = get_headers(index)
    
    if not is_broad:
        get_headers_with_nifty(index,headers)
    
    one_year, three_year, five_year = [], [], []
    get_year_returns(index,is_broad,one_year,three_year,five_year)
    
    data = [
        ("comparable", headers),
        ("1 year", one_year),
        ("3 Year", three_year),
        ("5 year", five_year)
    ]

    df = pd.DataFrame(
        OrderedDict([(name, col_data ) for (name, col_data) in (item for item in data) ])
    )

    table =  dbc.Row(
        [
        dbc.Col(
                    html.Div([
                        dash_table.DataTable(
                        data=df.to_dict('records'),
                        columns=[{'id': c, 'name': c} for c in df.columns],
                        style_cell={'textAlign': 'center','font-family':'Nunito Sans', 'padding': '10px'},
                        id='table',
                        style_data_conditional=[
                            {
                                'if': {
                                    'filter_query': '{{{col}}} >= 1.5'.format(col=col),
                                    'column_id': col
                                },
                                'backgroundColor': 'green',
                                'color': 'white'
                            } for col in df.columns
                        ] + 
                        [
                            {
                                'if': {
                                    'filter_query': '{{{col}}} < -1.5'.format(col=col),
                                    'column_id': col
                                },
                                'backgroundColor': 'red',
                                'color': 'white'
                            } for col in df.columns
                        ]
                        )
                        ]),
                        width={"size": 11,'offset':1},
                        style={'margin-top':'2rem','margin-bottom':'2rem'}
                    ),
        ],
        style={'width':'100%'}
    )
    
    return table
    
    
    