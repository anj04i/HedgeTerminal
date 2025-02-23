from typing import Dict
import streamlit as st
import pandas as pd

from api import FundsAPI
from components.metrics_panel import MetricsPanel
from components.fund_chart import FundChart
from components.filing_table import FilingTable


class FundView:
    def __init__(self, api: FundsAPI):
        self.api = api

    def _calculate_metrics(self, df: pd.DataFrame) -> Dict:
        latest_value = df["total_value"].iloc[-1]
        latest_date = df["filing_date"].iloc[-1]
        prev_value = df["total_value"].iloc[-2] if len(df) > 1 else None

        pct_change = None
        if prev_value is not None:
            pct_change = f"{((latest_value / prev_value) - 1) * 100:.1f}%"

        return {
            "Latest AUM": (f"${latest_value:,.0f}", pct_change),
            "Last Filing": (latest_date.strftime("%Y-%m-%d"), None),
            "Total Filings": (str(len(df)), None),
            "First Filing": (df["filing_date"].iloc[0].strftime("%Y-%m-%d"), None),
        }

    def render(self, fund_name: str, fund_id: str):
        filings = self.api.get_fund_filings(fund_id)
        if not filings:
            st.warning(f"No filings found for {fund_name}")
            return

        df = pd.DataFrame(filings)
        df["filing_date"] = pd.to_datetime(df["filing_date"])
        df["total_value"] = pd.to_numeric(df["total_value"])
        df = df.sort_values("filing_date")

        if len(df) > 0:
            metrics = self._calculate_metrics(df)
            MetricsPanel.render(metrics)

            st.header("AUM History")
            FundChart.render_aum_chart(df, fund_name)

            st.header("Filing History")
            FilingTable.render(df)
