from dash import Dash, html, dcc
import dash_bootstrap_components as dbc
from client.components.navbar import navbar


app = Dash(__name__, external_stylesheets=[dbc.themes.LUX],suppress_callback_exceptions=True)
app.title = 'Nariman Point'

app.layout = html.Div([
    dcc.Location(id='url', refresh=False),
    navbar,
    html.Div(id='page-content')
])

if __name__ == '__main__':
    app.run_server(debug=True)
