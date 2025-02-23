import streamlit as st
import pandas as pd
from typing import List


class FilingTable:
    @staticmethod
    def render(df: pd.DataFrame):
        formatted_df = FilingTable._format_dataframe(df)
        st.dataframe(formatted_df, hide_index=True, use_container_width=True)

    @staticmethod
    def _format_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        if "total_value" in df.columns:
            df["total_value"] = df["total_value"].apply(lambda x: f"${x:,.0f}")

        if "filing_date" in df.columns:
            df["filing_date"] = pd.to_datetime(df["filing_date"]).dt.strftime(
                "%Y-%m-%d"
            )

        return df[["filing_date", "total_value", "accession_number"]]
