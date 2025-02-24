import streamlit as st
import pandas as pd


class FilingTable:
    @staticmethod
    def render(df: pd.DataFrame, fund_name: str):
        formatted_df = pd.DataFrame(
            {
                "Fund": fund_name,
                "Quarter": df["quarter"],
                "AUM": df["value_usd"].apply(lambda x: f"${x:,.0f}"),
            }
        )
        st.dataframe(formatted_df, hide_index=True, use_container_width=True)
