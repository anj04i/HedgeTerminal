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

    def render(self, fund_name: str, fund_id: str):
        filings = self.api.get_fund_filings(fund_id)
        if not filings:
            st.warning(f"No filings found for {fund_name}")
            return

        df = pd.DataFrame(filings)
        df["value_usd"] = pd.to_numeric(df["value_usd"])

        if len(df) > 0:
            metrics = self._calculate_metrics(df)
            MetricsPanel.render(metrics)

            st.header("AUM History")
            FundChart.render_aum_chart(df, fund_name)

            st.header("Filing History")
            FilingTable.render(df, fund_name)
