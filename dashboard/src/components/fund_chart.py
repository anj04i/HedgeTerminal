import plotly.graph_objects as go
import streamlit as st
import pandas as pd


class FundChart:
    @staticmethod
    def render_aum_chart(df: pd.DataFrame, fund_name: str):
        fig = go.Figure()

        fig.add_trace(
            go.Scatter(
                x=df["filing_date"],
                y=df["total_value"],
                name="AUM",
                mode="lines",
                line=dict(width=2),
            )
        )

        fig.update_layout(
            title=f"{fund_name} Assets Under Management",
            xaxis_title="Date",
            yaxis_title="AUM ($)",
            height=400,
            showlegend=True,
            hovermode="x unified",
            yaxis=dict(tickformat="$,.0f"),
        )

        st.plotly_chart(fig, use_container_width=True)
