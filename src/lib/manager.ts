import xml2js from "xml2js";
import {
  CIKType,
  ErrorType,
  Extract13FRecord,
  Result,
  SECFiling,
  SECFilingRecord,
} from "./types";
import { CIK } from "./cik";
import pLimit from "p-limit";

export class EdgarManager {
  private CIK: CIKType;
  private parser = new xml2js.Parser();
  private SUBMISSION_URL = "https://data.sec.gov/submissions";

  constructor(cik: string | number) {
    this.CIK = new CIK(cik);
  }

  // private delay(ms: number): Promise<void> {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  private async get<T>(url: string): Promise<Result<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Company Name name@example.com",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            type: ErrorType.FETCH_ERROR,
            error: new Error(`Request failed with status ${response.status}`),
          },
        };
      }

      const data = url.endsWith(".xml")
        ? await response.text()
        : await response.json();

      return { success: true, data: data as T };
    } catch (err) {
      return {
        success: false,
        error: {
          type: ErrorType.FETCH_ERROR,
          error: err instanceof Error ? err : new Error("Unknown error"),
        },
      };
    }
  }

  public async getSecFilingsDetails(): Promise<Result<SECFiling>> {
    const url = `${this.SUBMISSION_URL}/${this.CIK.getPadded()}.json`;
    const res = await this.get<SECFiling>(url);
    if (!res.success) return res;
    return { success: true, data: res.data };
  }

  private prepareXMLFilingURL(accessionNumber: string) {
    const cleanAccession = accessionNumber.replace(/-/g, "");
    return `https://www.sec.gov/Archives/edgar/data/${this.CIK.unpad()}/${cleanAccession}/primary_doc.xml`;
  }

  public getRecentDetails(filing: SECFiling): SECFilingRecord[] {
    const { recent } = filing.filings;
    const length = recent.accessionNumber.length;
    const result = new Array<SECFilingRecord>(length);

    for (let i = 0; i < length; i++) {
      result[i] = {
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i] || null,
        acceptanceDateTime: recent.acceptanceDateTime[i],
        act: recent.act[i] || null,
        form: recent.form[i],
        fileNumber: recent.fileNumber[i] || null,
        filmNumber: recent.filmNumber[i] || null,
        items: recent.items[i] || null,
        size: recent.size[i],
        isXBRL: !!recent.isXBRL[i],
        isInlineXBRL: !!recent.isInlineXBRL[i],
        primaryDocument: recent.primaryDocument[i],
        primaryDocDescription: recent.primaryDocDescription[i] || null,
        filingURL: this.prepareXMLFilingURL(recent.accessionNumber[i]),
      };
    }
    return result;
  }

  public filter13F(filings: SECFilingRecord[]): SECFilingRecord[] {
    const filtered: SECFilingRecord[] = [];
    for (let i = 0; i < filings.length; i++) {
      const form = filings[i].form;
      // Ignoring ammendments 13F-HR/A
      if (form === "13F-HR") {
        filtered.push(filings[i]);
      }
    }
    return filtered;
  }

  public async fetch13FRecord(
    recent: SECFilingRecord
  ): Promise<Result<number>> {
    const res = await this.get<string>(recent.filingURL);
    if (!res.success) return res;

    try {
      const result = await this.parser.parseStringPromise(res.data);
      const schemaVersion = result.edgarSubmission?.schemaVersion || '';
      const summary = result.edgarSubmission.formData[0].summaryPage[0];
      let totalValue = Number(summary.tableValueTotal[0]);
      
      if(schemaVersion != "X0202"){
        totalValue *= 1000; // Convert to $$ for non-X0202
      }

      return { success: true, data: totalValue };
    } catch (err) {
      return {
        success: false,
        error: {
          type: ErrorType.PARSE_ERROR,
          error: err instanceof Error ? err : new Error("Unknown error"),
        },
      };
    }
  }

  public async extract13FRecords(
    recent: SECFilingRecord[]
  ): Promise<Extract13FRecord[]> {
    const limit = pLimit(10);
    const promises = recent.map((filing) =>
      limit(() =>
        this.fetch13FRecord(filing).then((res) =>
          res.success
            ? {
                accessionNumber: filing.accessionNumber,
                filingDate: filing.filingDate,
                reportDate: filing.reportDate,
                totalValue: res.data,
              }
            : null
        )
      )
    );

    const results = await Promise.all(promises);
    return results.filter((r): r is Extract13FRecord => r !== null);
  }

  public async get13FHistory(): Promise<Extract13FRecord[]> {
    const details = await this.getSecFilingsDetails();
    if (!details.success) return [];

    const recent = this.getRecentDetails(details.data);
    const only13F = this.filter13F(recent);
    return this.extract13FRecords(only13F);
  }
}
