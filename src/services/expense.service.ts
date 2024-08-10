import { Injectable } from "@angular/core";
import { Expense } from "../models/expense";
import { CrudSqlService } from "./crud-sql.service";
import { ExpenseListModel } from "../models/expenseListModel";

@Injectable({
  providedIn: "root",
})
export class ExpenseService extends CrudSqlService<Expense> {
  constructor() {
    super();
    this.documentName = "expense";
  }
  async getAllModel(
    userId: string,
    orderby?: string
  ): Promise<ExpenseListModel[]> {
    await this.loadDb();
    let sql = ` SELECT  expense._id, expense.description, amount, date, category.description as category
    FROM
      ${this.documentName}    
     Left JOIN
        category ON expense.categoryId = category._id
     where
      expense.userId=$1
   `;
    if (orderby) {
      sql += ` order by ${orderby}`;
    }
    const response: ExpenseListModel[] = await this.db.select<
      ExpenseListModel[]
    >(sql, [userId]);
    return response;
  }
}
