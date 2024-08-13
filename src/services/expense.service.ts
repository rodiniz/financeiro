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
         LIMIT ${recordsPerPage} OFFSET ${offset}
   `;
    if (orderby) {
      sql += ` order by ${orderby}`;
    }

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
