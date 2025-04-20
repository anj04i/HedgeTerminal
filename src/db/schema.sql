CREATE TABLE FILINGS (
    cik VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    accession_number VARCHAR(20) NOT NULL,
    filing_date DATE NOT NULL,
    report_date DATE NOT NULL,
    total_value NUMERIC NOT NULL,
    PRIMARY KEY (cik, accession_number)
);

CREATE INDEX idx_filings_date ON FILINGS(filing_date);

CREATE INDEX idx_filings_name ON FILINGS(name);

CREATE INDEX idx_filings_total_value ON FILINGS(total_value);

CREATE INDEX idx_filings_cik_date ON FILINGS(cik, filing_date);

CREATE INDEX idx_filings_cik_report_date ON FILINGS(cik, report_date);

CREATE TABLE HOLDINGS (
    cik VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    PRIMARY KEY (cik, name, title, class)
);

CREATE INDEX idx_holdings_cik ON HOLDINGS(cik);

CREATE INDEX idx_holdings_name ON HOLDINGS(name);

CREATE INDEX idx_holdings_cik_name ON HOLDINGS(cik, name);

CREATE INDEX idx_holdings_value ON HOLDINGS(value);