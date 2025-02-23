CREATE TABLE FILINGS (
    cik VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    accession_number VARCHAR(20) NOT NULL,
    filing_date DATE NOT NULL,
    total_value NUMERIC NOT NULL,
    PRIMARY KEY (cik, accession_number)
);