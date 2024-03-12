from dash import callback, Output, Input
import dash_bootstrap_components as dbc
from src.components.returns import returns
from src.components.dashboard import dashboard
from src.components.charts import charts

navbar = dbc.NavbarSimple(
    children=[
        dbc.NavItem(dbc.NavLink("Charts", href="/")),
        dbc.NavItem(dbc.NavLink("Returns", href="/returns")),
        dbc.NavItem(dbc.NavLink("Dashboard", href="/dashboard")),
    ],
    brand="Sicomoro",
    brand_href="/",
    color="primary",
    dark=True,
    id='navbar'
)

@callback(
    Output('page-content', 'children'),
    [Input('url', 'pathname')]
)
def display_page(pathname):
    if pathname == '/':
        return charts
    elif pathname == '/returns':
        return returns
    else:
        return dashboard