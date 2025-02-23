import streamlit as st
from typing import Dict, Union, Tuple


class MetricsPanel:
    @staticmethod
    def render(metrics: Dict[str, Union[str, Tuple[str, str]]]):
        cols = st.columns(len(metrics))
        for col, (label, value) in zip(cols, metrics.items()):
            if isinstance(value, tuple):
                col.metric(label, value[0], value[1])
            else:
                col.metric(label, value)
