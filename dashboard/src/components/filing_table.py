import streamlit as st
import pandas as pd

class FilingTable:
    @staticmethod
    def render(df: pd.DataFrame, fund_name: str):
        formatted_df = pd.DataFrame(
            {
                "Fund": fund_name,
                "Quarter": df["quarter"],
                "AUM": df["value_usd"],
            }
        )
        formatted_df["sort_key"] = formatted_df["Quarter"].apply(
            lambda q: f"{q[-4:]}-{int(q[1]):02d}"
        )
        formatted_df = formatted_df.sort_values(by="sort_key", ascending=False)
        formatted_df = formatted_df.drop(columns=["sort_key"])
        st.dataframe(formatted_df, hide_index=True, use_container_width=True)
