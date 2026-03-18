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
  async Exists(expense: Expense) {
    await this.loadDb();

    let sql = ` SELECT  *
    FROM
      ${this.documentName}  
        where description= $1 
        and amount=$2
        and date=$3
        and userId=$4
   `;
    const response = await this.db.select<Expense[]>(sql, [
      expense.description,
      expense.amount,
      expense.date, 
      expense.userId
    ]);
    return response.length > 0;
  }
  async getAllModel(
    userId: string,
    pageIndex: number,
    onlyWithoutCategory: boolean,
    monthYear: string | undefined | null,
    category:number|undefined| null,
    orderby?: string
  ): Promise<PagedList<ExpenseListModel>> {
    await this.loadDb();

    const recordsPerPage = 10;
    let offset = recordsPerPage * (pageIndex - 1);
    let countsql =
      "SELECT count(*) as cont from expense Left JOIN  category" +
      " ON expense.categoryId = category._id where expense.userId=$1  ";



    if (onlyWithoutCategory) {
      countsql += ` and category._id is null`;
    }
   
    if (monthYear) {
      countsql += ` and strftime( '%m', date )|| '/'||  strftime('%Y', date)=$2`;
    }

    if (category) {
      countsql += ` and category._id =$3`;
    }

    const responseCount = await this.db.select<any>(countsql, [
      userId,
      monthYear,
    ]);

    let sql = ` SELECT  expense._id, expense.description, amount, date, category.description as category
    FROM
      ${this.documentName}    
     Left JOIN
        category ON expense.categoryId = category._id
     where
      expense.userId=$1      
   `;
    if (onlyWithoutCategory) {
      sql += ` and category._id is null`;
    }
    if (monthYear) {
      sql += ` and strftime( '%m', date )|| '/'||  strftime('%Y', date)=$2`;
    }
    
    if (category) {
      sql += ` and category._id =$3`;
    }

    if (orderby) {
      sql += ` order by ${orderby}`;
    }

    sql += `  LIMIT ${recordsPerPage} OFFSET ${offset}`;

    const response: ExpenseListModel[] = await this.db.select<
      ExpenseListModel[]
    >(sql, [userId, monthYear,category]);

    let pagedResponse = {
      data: response,
      totalRecords: responseCount[0].cont,
    } as PagedList<ExpenseListModel>;

    return pagedResponse;
  }
}
