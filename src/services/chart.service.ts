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
  async getByYear(): Promise<BarChartModel> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount, substr( date, 7, 4 )as ano, substr( date, 4, 2 )as mes from expense          
          group by substr( date, 4, 2 )
   `;

    const response = await this.db.select<any>(sql);
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
