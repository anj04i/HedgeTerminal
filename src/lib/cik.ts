export class CIK {
  private cik: string;

  constructor(cik: string | number) {
    this.cik = `CIK${cik.toString().padStart(10, '0')}`;
  }

  public unpad(): string {
    return this.cik.replace('CIK', '').replace(/^0+/, '');
  }

  public getPadded(): string {
    return this.cik;
  }
}
