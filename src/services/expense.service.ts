import { Injectable } from "@angular/core";
import { Expense } from "../models/expense";
import { CrudSqlService } from "./crud-sql.service";
import { ExpenseListModel } from "../models/expenseListModel";
import { PagedList } from "../models/pagedList";

@Injectable({
  providedIn: "root",
})
export class ExpenseService extends CrudSqlService<Expense> {
  constructor() {
    super();
    this.documentName = "expense";
  }
  async DeleteAll() {
    await this.loadDb();
    await this.db.execute(`DELETE FROM ${this.documentName}`);
  }
  async Exists(expense: any) {
    await this.loadDb();

    let sql = ` SELECT  *
    FROM
      ${this.documentName}  
        where description= $1 
        and amount=$2
        and date=$3

   `;
    const response = await this.db.select<Expense[]>(sql, [
      expense.description,
      expense.amount,
      expense.date,
    ]);
    return response.length > 0;
  }
  async getAllModel(
    userId: string,
    pageIndex: number,
    orderby?: string
  ): Promise<PagedList<ExpenseListModel>> {
    await this.loadDb();

    const recordsPerPage = 7;
    let offset = recordsPerPage * (pageIndex - 1);
    let countsql = "SELECT count(*) as cont from expense";
    const responseCount = await this.db.select<any>(countsql);

    const totalPage = Math.round(
      (responseCount[0].cont + recordsPerPage - 1) / recordsPerPage
    );
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

    sql += `  LIMIT ${recordsPerPage} OFFSET ${offset}`;

    const response: ExpenseListModel[] = await this.db.select<
      ExpenseListModel[]
    >(sql, [userId]);

    let pagedResponse = {
      data: response,
      numberOfpages: totalPage,
    } as PagedList<ExpenseListModel>;

    return pagedResponse;
  }
}
