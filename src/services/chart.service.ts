import { Injectable } from "@angular/core";
import Database from "tauri-plugin-sql-api";
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
    let sql = ` select sum(amount) as amount, substr( date, 7, 4 )as ano, substr( date, 4, 2 )as mes from expense          
          where substr( date, 7, 4 )=$1 group by substr( date, 4, 2 ) 
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
                join category cat on cat._id = expense.categoryId where substr( date, 4, 2 )|| '/'|| substr( date, 7, 4 )=$1 group by expense.categoryId`;

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

  async getChartYears(): Promise<Array<any>> {
    await this.loadDb();
    let sql = ` select distinct substr( date, 7, 4 )as year from expense`;
    const response = await this.db.select<any>(sql);

    return response;
  }

  async getChartMonthYears(): Promise<Array<any>> {
    await this.loadDb();
    let sql = ` select distinct substr( date, 4, 2 )|| '/'|| substr( date, 7, 4 ) as monthYear from expense`;
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
