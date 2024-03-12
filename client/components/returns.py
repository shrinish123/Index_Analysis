from dash import html, dcc, callback, Output, Input
from indices_analysis.compare_nifty_indices_return_divergence import plot_return_divergence
from client.utils import get_all_indices
# from indices_analysis.update_data import updateData
import dash_bootstrap_components as dbc

indices = get_all_indices()
items = [dbc.DropdownMenuItem(index) for index in indices]


dropdown_layout = dbc.Row(
            [
                dbc.Col(
                    html.Div([
                        html.P(children='Select Benchmark'),
                        dcc.Dropdown(indices,'NIFTY 50', id='benchmark-selection-dropdown', placeholder='Select Benchmark',style={'width':'30rem'})
                    ]),
                    width={"size": 4,'offset':1},
                    style={'margin-top':'2rem'}
                ),
                dbc.Col(
                    html.Div([
                        html.P(children='Select Index'),
                        dcc.Dropdown(indices,'NIFTY NEXT 50', id='index-selection-dropdown', placeholder='Select Index',style={'width':'30rem'})
                    ]),
                    width={"size": 4,'offset':1},
                    style={'margin-top':'2rem'}
                ),
            ],
            style={'width':'100%'}
            
)

graph_layout = html.Div([
    dbc.Row(
    [
       dbc.Col(
                    html.Div([
                        dcc.Graph(id='graph-1 year'),
                    ]),
                    width={"size": 11,'offset':1},
                    style={'margin-top':'2rem'}
                ),
    ],
    style={'width':'100%'}
    ),
    dbc.Row(
    [
       dbc.Col(
                    html.Div([
                        dcc.Graph(id='graph-3 year'),
                    ]),
                    width={"size": 11,'offset':1},
                    style={'margin-top':'2rem'}
                ),
    ],
    style={'width':'100%'}
    ),
    dbc.Row(
    [
       dbc.Col(
                    html.Div([
                        dcc.Graph(id='graph-5 year'),
                    ]),
                    width={"size": 11,'offset':1},
                    style={'margin-top':'2rem'}
                ),
    ],
    style={'width':'100%'}
    ),
]) 

returns = html.Div([
    dropdown_layout,
    graph_layout,
])

@callback(
    Output('graph-1 year', 'figure'),
    Output('graph-3 year', 'figure'),
    Output('graph-5 year', 'figure'),
    Input('benchmark-selection-dropdown', 'value'),
    Input('index-selection-dropdown', 'value'),
)
def update_graph(benchmark, index):
    # updateData() -> improve the effciency for this function
    plot_1,plot_3,plot_5 = plot_return_divergence(index,benchmark)
    return plot_1,plot_3,plot_5