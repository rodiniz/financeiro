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

  async getExpenseBreakdown(startDate: string | null, endDate: string | null): Promise<{ fixedCosts: number; variableCosts: number }> {
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = `
      SELECT
        COALESCE(SUM(CASE WHEN recurrent = 1 THEN amount ELSE 0 END), 0) AS fixedCosts,
        COALESCE(SUM(CASE WHEN recurrent = 0 OR recurrent IS NULL THEN amount ELSE 0 END), 0) AS variableCosts
      FROM expense
      WHERE userId = $1`;

    const params: any[] = [userId];
    if (startDate) {
      sql += ` AND date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const response = await this.db.select<any>(sql, params);
    return {
      fixedCosts: response[0]?.fixedCosts ?? 0,
      variableCosts: response[0]?.variableCosts ?? 0,
    };
  }

  async getTotalExpenses(startDate: string | null, endDate: string | null): Promise<number> {
    
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = `SELECT SUM(amount) as amount FROM expense WHERE userId=$1`;

    const params: any[] = [userId];
    if (startDate) {
      sql += ` AND date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const response = await this.db.select<any>(sql, params);
    
    return response[0].amount;
  }

  async getTotalIncome(startDate: string | null, endDate: string | null): Promise<number> {
    await this.loadDb();
    const userId = this.userService.getCurrentUser();
    let sql = `SELECT SUM(amount) as amount FROM income WHERE userId=$1`;

    const params: any[] = [userId];
    if (startDate) {
      sql += ` AND date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const response = await this.db.select<any>(sql, params);
    
    return response[0].amount;
  }

  async getTopExpenses(startDate: string | null, endDate: string | null): Promise<BarChartModel> {
    await this.loadDb();
    let sql = `SELECT SUM(amount) as amount, cat.description FROM expense
                JOIN category cat ON cat._id = expense.categoryId WHERE userId=$1`;
                
    const params: any[] = [this.userService.getCurrentUser()];
    if (startDate) {
      sql += ` AND date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date <= $${params.length + 1}`;
      params.push(endDate);
    }
    sql += " GROUP BY expense.categoryId ORDER BY amount DESC LIMIT 5";
    
    const response = await this.db.select<any>(sql, params);
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
