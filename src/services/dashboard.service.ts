import {inject, Injectable} from '@angular/core';
import Database from "@tauri-apps/plugin-sql";
import {UsersService} from './users.service';
import {BarChartModel} from '../models/barchartModel';
import {ExpenseListModel} from "../models/expenseListModel";
import {EvolutionModel} from "../models/EvolutionModel";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  protected db!: Database;
  userService = inject(UsersService);
  async loadDb() {
    this.db = await Database.load("sqlite:financeiro.db");
  }
  constructor() { }

  async getExpenseBreakdown(yearMonth: string | null): Promise<{ fixedCosts: number; variableCosts: number }> {
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = `
      SELECT
        COALESCE(SUM(CASE WHEN recurrent = 1 THEN amount ELSE 0 END), 0) AS fixedCosts,
        COALESCE(SUM(CASE WHEN recurrent = 0 OR recurrent IS NULL THEN amount ELSE 0 END), 0) AS variableCosts
      FROM expense
      WHERE userId = $1`;

    if (yearMonth) {
      sql += ` and strftime('%m', date) || '/' || strftime('%Y', date)=$2`;
    }

    const response = await this.db.select<any>(sql, [userId, yearMonth]);
    return {
      fixedCosts: response[0]?.fixedCosts ?? 0,
      variableCosts: response[0]?.variableCosts ?? 0,
    };
  }

  async getTotalExpenses(yearMonth: string|null): Promise<number> {
    
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = ` select sum(amount) as amount from expense where userId=$1`;

    if(yearMonth) {
      sql += ` and strftime('%m', date) || '/' || strftime('%Y', date)=$2`;
    }

    const response = await this.db.select<any>(sql, [userId, yearMonth]);
    
    return response[0].amount;
  }

  async getTotalIncome(yearMonth: string|null): Promise<number> {
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = ` select sum(amount) as amount from income where userId=$1`;

    if(yearMonth) {
      sql += ` and strftime('%m', date) || '/' || strftime('%Y', date)=$2`;
    }

    const response = await this.db.select<any>(sql, [userId, yearMonth]);
    
    return response[0].amount;
  }

    async getTopExpenses(monthYear: string|null): Promise<BarChartModel> {
      await this.loadDb();
      let sql = ` select sum(amount) as amount, cat.description from expense
                  join category cat on cat._id = expense.categoryId where  userId=$1 `;
                
      if(monthYear) {
        sql += ` and strftime( '%m', date )|| '/'||  strftime('%Y', date)=$2`;
      }
       sql += " group by expense.categoryId order by amount desc limit 5 ";
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
    
    async getEvolutionIncome():Promise<Array<EvolutionModel>> {
      await this.loadDb();
      let sql = ` select sum(amount) as amount, strftime( '%Y', date )|| '-'|| strftime('%m', date)
        as monthYear from income where  userId=$1
        group by monthYear order by monthYear`;

      const userId = this.userService.getCurrentUser();
      return await this.db.select<EvolutionModel[]>(sql, [userId]);
    }
    
  async getEvolutionExpense():Promise<Array<EvolutionModel>> {
    await this.loadDb();
    let sql = ` select sum(amount) as amount, strftime( '%Y', date )|| '-'|| strftime('%m', date)
        as monthYear from expense where  userId=$1
        group by monthYear order by monthYear`;

    const userId = this.userService.getCurrentUser();
    return await this.db.select<EvolutionModel[]>(sql, [userId]);
  }
}
