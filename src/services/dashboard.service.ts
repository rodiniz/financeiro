import { inject, Injectable } from '@angular/core';
import Database from "@tauri-apps/plugin-sql";
import { UsersService } from './users.service';

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
}
