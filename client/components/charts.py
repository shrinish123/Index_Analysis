from dash import html, dcc, callback, Output, Input
from indices_analysis.compare_nifty_indices_return_divergence import plot_charts
from client.utils import get_all_indices
# from indices_analysis.update_data import updateData
import dash_bootstrap_components as dbc

indices = get_all_indices()
items = [dbc.DropdownMenuItem(index) for index in indices]

dropdown_layout = dbc.Row(
            [
                dbc.Col(
                    html.Div([
                        html.P(children='Select Index'),
                        dcc.Dropdown(indices,'NIFTY 50', id='index-selection-dropdown', placeholder='Select Index',style={'width':'30rem'})
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
                        dcc.Graph(id='graph-closing-price'),
                    ]),
                    width={"size": 11,'offset':1},
                    style={'margin-top':'2rem'}
                ),
    ],
    style={'width':'100%'}
    )
]) 

charts = html.Div([
    dropdown_layout,
    graph_layout,
])

@callback(
    Output('graph-closing-price', 'figure'),
    Input('index-selection-dropdown', 'value')
)
def update_graph(index):
    # updateData() -> improve the effciency for this function
    plot_1 = plot_charts(index)
    return plot_1