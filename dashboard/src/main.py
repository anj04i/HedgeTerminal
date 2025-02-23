import streamlit as st
from api import FundsAPI
from views.fund_view import FundView


class FundDashboard:
    def __init__(self):
        self.api = FundsAPI()
        self.funds = {
            "Bridgewater": "1649339",
            "Renaissance": "1067983",
            "D.E. Shaw": "1555283",
            "Two Sigma": "1350694",
            "Citadel": "1167483",
        }

    def run(self):
        st.set_page_config(layout="wide", page_title="Fund 13F Dashboard")
        st.title("Fund 13F Dashboard")

        fund_name = st.selectbox("Select Fund", list(self.funds.keys()))
        fund_id = self.funds[fund_name]

        FundView(self.api).render(fund_name, fund_id)


if __name__ == "__main__":
    app = FundDashboard()
    app.run()
