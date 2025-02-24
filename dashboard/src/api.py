from typing import Dict, List
import requests


class FundsAPI:
    BASE_URL = "http://localhost:3000/api"
    _session = requests.Session()

    def get_fund_filings(self, identifier: str) -> List[Dict]:
        response = self._session.get(f"{self.BASE_URL}/funds/{identifier}/filings")
        return response.json()["filings"] if response.ok else []

    def get_funds(self) -> Dict[str, str]:
        response = self._session.get(f"{self.BASE_URL}/config")
        if not response.ok:
            return {}
        return {fund["name"]: fund["cik"] for fund in response.json()["funds"]}
