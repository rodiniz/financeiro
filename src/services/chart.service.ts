import { Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";
import { BarChartModel } from "../models/barchartModel";

@Injectable({
  providedIn: "root",
})
export class ChartService {
  protected db!: Database;
  protected documentName: string | undefined;
  constructor() {}
  async loadDb() {
    this.db = await Database.load("sqlite:financeiro.db");
  }
  async getByYear(year: number): Promise<BarChartModel> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount,  strftime('%Y', date) as ano, strftime( '%m', date ) as mes from expense          
          where  strftime('%Y', date) =$1 group by strftime( '%m', date )
   `;

    const response = await this.db.select<any>(sql, [year]);
    let series: Array<number> = [];
    let xaxis: Array<number | string> = [];
    response.forEach((c: any) => {
      series.push(c.amount), xaxis.push(this.formatMonth(parseInt(c.mes, 10)));
    });
    return {
      series: {
        name: "",
        data: series,
      },
      xaxis: {
        categories: xaxis,
      },
    } as BarChartModel;
  }

  async getByMonthYear(monthYear: string): Promise<BarChartModel> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount, cat.description from expense
                join category cat on cat._id = expense.categoryId where strftime( '%m', date )|| '/'||  strftime('%Y', date)=$1 group by expense.categoryId`;

    const response = await this.db.select<any>(sql, [monthYear]);
    let series: Array<number> = [];
    let xaxis: Array<number | string> = [];
    response.forEach((c: any) => {
      series.push(c.amount), xaxis.push(c.description);
    });
    return {
      series: {
        name: "",
        data: series,
      },
      xaxis: {
        categories: xaxis,
      },
    } as BarChartModel;
  }

  async getTotalByMonthYear(monthYear: string): Promise<number> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount from expense
                where strftime( '%m', date )|| '/'||  strftime('%Y', date)=$1`;

    const response = await this.db.select<any>(sql, [monthYear]);
    return Math.round(response[0].amount);
  }

  async getChartYears(): Promise<Array<any>> {
    await this.loadDb();
    let sql = ` select distinct  strftime('%Y', date) as year from expense order by date`;
    const response = await this.db.select<any>(sql);

    return response;
  }

  async getChartMonthYears(): Promise<Array<any>> {
    await this.loadDb();
    let sql = `select distinct strftime( '%m', date )|| '/'|| strftime('%Y', date) as monthYear from expense order by date`;
    const response = await this.db.select<any>(sql);

    return response;
  }
  formatMonth(monthNumber: number) {
    const monthNames = [
      "",
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return monthNames[monthNumber];
  }
}
