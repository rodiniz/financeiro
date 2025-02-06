import { inject, Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";
import { BarChartModel } from "../models/barchartModel";
import { UsersService } from "./users.service";

@Injectable({
  providedIn: "root",
})
export class ChartService {
  protected db!: Database;
  protected documentName: string | undefined;
  userService= inject(UsersService);
  constructor() {}
  async loadDb() {
    this.db = await Database.load("sqlite:financeiro.db");
  }
  async getByYear( year: number): Promise<BarChartModel> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount,  strftime('%Y', date) as ano, strftime( '%m', date ) as mes from expense          
          where  userId=$1 strftime('%Y', date) =$2 group by strftime( '%m', date )
   `;
    const userId = this.userService.getCurrentUser();
    const response = await this.db.select<any>(sql, [userId, year]);
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
                join category cat on cat._id = expense.categoryId where  userId=$1 and strftime( '%m', date )|| '/'||  strftime('%Y', date)=$2 group by expense.categoryId`;
    const userId = this.userService.getCurrentUser();
    const response = await this.db.select<any>(sql, [userId,monthYear]);
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
                where userId=$1 and strftime( '%m', date )|| '/'||  strftime('%Y', date)=$2`;
    const userId = this.userService.getCurrentUser();
    const response = await this.db.select<any>(sql, [userId, monthYear]);
    return Math.round(response[0].amount);
  }

  async getTotalIncomeByMonthYear(monthYear: string): Promise<number> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount from income
                where  userId=$1 and strftime( '%m', date )|| '/'||  strftime('%Y', date)=$1`;
    const userId = this.userService.getCurrentUser();
    const response = await this.db.select<any>(sql, [userId,monthYear]);
    return Math.round(response[0].amount);
  }

  async getChartYears(): Promise<Array<any>> {
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = ` select distinct  strftime('%Y', date) as year from expense where  userId=$1  order by date`;
    const response = await this.db.select<any>(sql,[userId]);

    return response;
  }

  async getChartMonthYears(): Promise<Array<any>> {
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = `select distinct strftime( '%m', date )|| '/'|| strftime('%Y', date) as monthYear from expense  where  userId=$1 order by date`;
    const response = await this.db.select<any>(sql,[userId]);

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
