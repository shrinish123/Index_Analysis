from dash import html
import dash_bootstrap_components as dbc
from indices_analysis.constants import broad,sector,theme,smartBeta
from client.utils import build_table


tabs = dbc.Tabs(
    [
        dbc.Tab(build_table(broad,True), label="Broad Indices"),
        dbc.Tab(build_table(sector), label="Sectorial Indices"),
        dbc.Tab(build_table(theme), label='Thematic Indices'),
        dbc.Tab(build_table(smartBeta), label='SmartBeta Indices'),
    ]
)

dashboard  = html.Div([
    html.H2('Dashboard',style={'margin':'2rem'}),
    tabs
])
