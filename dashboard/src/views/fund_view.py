import re
from typing import Dict
import streamlit as st
import pandas as pd
from components.metrics_panel import MetricsPanel
from components.fund_chart import FundChart
from components.filing_table import FilingTable


class FundView:
    def __init__(self, api):
        self.api = api

    def _calculate_metrics(self, df: pd.DataFrame) -> Dict:
        latest_value = df["value_usd"].iloc[-1]
        latest_quarter = df["quarter"].iloc[-1]
        prev_value = df["value_usd"].iloc[-2] if len(df) > 1 else None

        pct_change = None
        if prev_value is not None:
            pct_change = f"{((latest_value / prev_value) - 1) * 100:.1f}%"

        return {
            "Latest AUM": (f"${latest_value:,.0f}", pct_change),
            "Last Quarter": (latest_quarter, None),
            "Total Quarters": (str(len(df)), None),
            "First Quarter": (df["quarter"].iloc[0], None),
        }

    def _calculate_volatility(self, df: pd.DataFrame) -> pd.DataFrame:
        df["pct_change"] = df["value_usd"].pct_change() * 100
        df["volatility"] = df["pct_change"].rolling(window=4).std()
        return df.dropna()

    def render(self, fund_name: str, fund_id: str):
        filings = self.api.get_fund_filings(fund_id)
        if not filings:
            st.warning(f"No filings found for {fund_name}")
            return

        df = pd.DataFrame(filings)
        df["value_usd"] = pd.to_numeric(df["value_usd"])
        df = self._calculate_volatility(df)

        if len(df) > 0:
            metrics = self._calculate_metrics(df)
            MetricsPanel.render(metrics)

            st.header("AUM History")
            FundChart.render_aum_chart(df, fund_name)

            st.header("AUM Volatility")
            st.markdown("This chart shows the rolling 4-quarter standard deviation of AUM percentage changes, indicating stability. A value above 10% suggests high volatility.")
            if len(df) < 4:
                st.warning("Not enough data for volatility analysis (requires at least 4 quarters).")
            else:
                FundChart.render_volatility_chart(df, fund_name)

            st.header("Filing History")
            FilingTable.render(df, fund_name)
