import xml2js from 'xml2js';
import {
  CIKType,
  ErrorType,
  Extract13FRecord,
  Result,
  SEC13FHolding,
  SECFiling,
  SECFilingRecord,
} from './types';
import { CIK } from './cik';
import pLimit from 'p-limit';

export class EdgarManager {
  private CIK: CIKType;
  private parser = new xml2js.Parser();
  private SUBMISSION_URL = 'https://data.sec.gov/submissions';

  constructor(cik: string | number) {
    this.CIK = new CIK(cik);
  }

  // private delay(ms: number): Promise<void> {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  private stripPrimaryDoc(url: string): string {
    return url.replace(/primary_doc\.xml$/, '');
  }

  private async get<T>(url: string): Promise<Result<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Company Name name@example.com',
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

      const data = url.endsWith('.xml')
        ? await response.text()
        : await response.json();

      return { success: true, data: data as T };
    } catch (err) {
      return {
        success: false,
        error: {
          type: ErrorType.FETCH_ERROR,
          error: err instanceof Error ? err : new Error('Unknown error'),
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
    const cleanAccession = accessionNumber.replace(/-/g, '');
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

  public async getFilingDetailsUrl(filingUrl: string): Promise<Result<string>> {
    const baseUrl = this.stripPrimaryDoc(filingUrl);
    try {
      const response = await fetch(baseUrl, {
        headers: { 'User-Agent': 'Company Name name@example.com' },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            type: ErrorType.FETCH_ERROR,
            error: new Error(`Failed to fetch index: ${response.status}`),
          },
        };
      }

      const html = await response.text();
      const matches = [...html.matchAll(/href="([^"]+\.xml)"/gi)];
      const xmlFiles = matches
        .map((m) => m[1])
        .filter((f) => !f.includes('primary_doc'));

      if (!xmlFiles.length) {
        return {
          success: false,
          error: {
            type: ErrorType.NOT_FOUND,
            error: new Error('No valid filing XML found'),
          },
        };
      }

      const filingDetailsUrl = new URL(xmlFiles[0], baseUrl).href;
      return { success: true, data: filingDetailsUrl };
    } catch (err) {
      return {
        success: false,
        error: {
          type: ErrorType.FETCH_ERROR,
          error: err instanceof Error ? err : new Error('Unknown error'),
        },
      };
    }
  }

  public filter13F(filings: SECFilingRecord[]): SECFilingRecord[] {
    const filtered: SECFilingRecord[] = [];
    for (let i = 0; i < filings.length; i++) {
      const form = filings[i].form;
      // Ignoring ammendments 13F-HR/A
      if (form === '13F-HR') {
        filtered.push(filings[i]);
      }
    }
    return filtered;
  }

  public async fetch13FRecord(
    recent: SECFilingRecord,
  ): Promise<Result<number>> {
    const res = await this.get<string>(recent.filingURL);
    if (!res.success) return res;

    try {
      const result = await this.parser.parseStringPromise(res.data);
      const schemaVersion = result.edgarSubmission?.schemaVersion || '';
      const summary = result.edgarSubmission.formData[0].summaryPage[0];
      let totalValue = Number(summary.tableValueTotal[0]);

      if (schemaVersion != 'X0202') {
        totalValue *= 1000; // Convert to $$ for non-X0202
      }

      return { success: true, data: totalValue };
    } catch (err) {
      return {
        success: false,
        error: {
          type: ErrorType.PARSE_ERROR,
          error: err instanceof Error ? err : new Error('Unknown error'),
        },
      };
    }
  }

  public async extract13FRecords(
    recent: SECFilingRecord[],
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
            : null,
        ),
      ),
    );

    const results = await Promise.all(promises);
    return results.filter((r): r is Extract13FRecord => r !== null);
  }

  public async getFilingHoldings(
    filingUrl: string,
  ): Promise<Result<SEC13FHolding[]>> {
    const detailsUrlResult = await this.getFilingDetailsUrl(filingUrl);
    if (!detailsUrlResult.success) return detailsUrlResult;

    const xmlResult = await this.get<string>(detailsUrlResult.data);
    if (!xmlResult.success) return xmlResult;

    try {
      // Configure parser to handle namespaces and avoid arrays for single elements
      const parser = new xml2js.Parser({ explicitArray: false });
      const parsed = await parser.parseStringPromise(xmlResult.data);

      // Dynamically check for informationTable (with or without ns1 prefix)
      const infoTableRoot =
        parsed['informationTable'] || parsed['ns1:informationTable'];
      if (!infoTableRoot) {
        return {
          success: false,
          error: {
            type: ErrorType.PARSE_ERROR,
            error: new Error('Missing informationTable in XML structure'),
          },
        };
      }

      const infoTables =
        infoTableRoot['infoTable'] || infoTableRoot['ns1:infoTable'];
      if (!infoTables || !Array.isArray(infoTables)) {
        return {
          success: false,
          error: {
            type: ErrorType.PARSE_ERROR,
            error: new Error('Missing or invalid infoTable in XML structure'),
          },
        };
      }

      const holdingsMap = new Map<
        string,
        { title: string; class: string; value: number }
      >();
      for (let i = 0; i < infoTables.length; i++) {
        const table = infoTables[i];
        const titleKey = table['nameOfIssuer'] || table['ns1:nameOfIssuer'];
        const classKey = table['titleOfClass'] || table['ns1:titleOfClass'];
        const valueKey = table['value'] || table['ns1:value'];

        if (!titleKey || !classKey || !valueKey) {
          continue; // Skip invalid entries
        }

        const key = `${titleKey}-${classKey}`;
        const value = Number(valueKey);
        if (holdingsMap.has(key)) {
          const existing = holdingsMap.get(key)!;
          holdingsMap.set(key, { ...existing, value: existing.value + value });
        } else {
          holdingsMap.set(key, {
            title: titleKey,
            class: classKey,
            value: value,
          });
        }
      }

      const holdings: SEC13FHolding[] = [];
      for (const [key, holding] of holdingsMap) {
        holdings.push(holding);
      }

      return { success: true, data: holdings };
    } catch (err) {
      return {
        success: false,
        error: {
          type: ErrorType.PARSE_ERROR,
          error: err instanceof Error ? err : new Error('Unknown error'),
        },
      };
    }
  }

  public async get13FHistory(): Promise<Extract13FRecord[]> {
    const details = await this.getSecFilingsDetails();
    if (!details.success) return [];

    const recent = this.getRecentDetails(details.data);
    const only13F = this.filter13F(recent);
    return this.extract13FRecords(only13F);
  }

  public async getLatestBuys(): Promise<Result<SEC13FHolding[]>> {
    const details = await this.getSecFilingsDetails();
    if (!details.success) {
      return {
        success: false,
        error: details.error,
      };
    }

    const recent = this.getRecentDetails(details.data);

    const only13F = this.filter13F(recent);
    if (only13F.length === 0) {
      return {
        success: false,
        error: {
          type: ErrorType.NOT_FOUND,
          error: new Error('No 13F filings found'),
        },
      };
    }

    const lastFilingUrl = only13F[0].filingURL;
    const holdingsResult = await this.getFilingHoldings(lastFilingUrl);
    return holdingsResult;
  }
}
