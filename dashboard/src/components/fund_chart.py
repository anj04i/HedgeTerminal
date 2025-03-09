import plotly.graph_objects as go
import streamlit as st
import pandas as pd


class FundChart:
    @staticmethod
    def render_aum_chart(df: pd.DataFrame, fund_name: str):
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=df["quarter"], y=df["value_usd"], name="AUM", mode="lines", line=dict(width=2)))
        fig.update_layout(
            title=f"{fund_name} Assets Under Management",
            xaxis_title="Quarter",
            yaxis_title="AUM ($)",
            height=400,
            showlegend=True,
            hovermode="x unified",
            yaxis=dict(tickformat="$,.0f"),
        )
        st.plotly_chart(fig, use_container_width=True)

    @staticmethod
    def render_volatility_chart(df: pd.DataFrame, fund_name: str):
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=df["quarter"], y=df["volatility"], name="Volatility", mode="lines", line=dict(width=2, color="red")))
        fig.add_hline(y=10, line_dash="dash", annotation_text="High Volatility Threshold", annotation_position="top right")
        fig.update_layout(
            title=f"{fund_name} AUM Volatility Over Time",
            xaxis_title="Quarter",
            yaxis_title="Volatility (Rolling Std Dev, %)",
            height=400,
            showlegend=True,
            hovermode="x unified",
        )
        st.plotly_chart(fig, use_container_width=True)
