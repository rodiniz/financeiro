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

  private parseMonthYear(monthYear: string): { month: number; year: number } | null {
    const parts = monthYear.split("/");
    if (parts.length !== 2) {
      return null;
    }

    const month = Number(parts[0]);
    const year = Number(parts[1]);

    if (!Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
      return null;
    }

    return { month, year };
  }

  private toIsoDate(year: number, month: number, day: number): string {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${monthStr}-${dayStr}`;
  }

  private getDayFromDate(value: string | null | undefined): number {
    if (!value) {
      return 1;
    }

    const datePart = value.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length !== 3) {
      return 1;
    }

    const day = Number(parts[2]);
    return Number.isInteger(day) && day > 0 ? day : 1;
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  async ensureRecurrentExpensesForMonth(userId: string, monthYear: string | null | undefined): Promise<number> {
    if (!monthYear) {
      return 0;
    }

    const parsed = this.parseMonthYear(monthYear);
    if (!parsed) {
      return 0;
    }

    await this.loadDb();

    const firstDayOfTargetMonth = this.toIsoDate(parsed.year, parsed.month, 1);
    const monthToken = `${String(parsed.month).padStart(2, "0")}/${parsed.year}`;

    const recurrentBases = await this.db.select<any[]>(
      `SELECT
         description,
         amount,
         categoryId,
         MAX(date(date)) as lastDate
       FROM ${this.documentName}
       WHERE userId = $1
         AND recurrent = 1
         AND date(date) < date($2)
       GROUP BY description, amount, categoryId`,
      [userId, firstDayOfTargetMonth]
    );

    let generatedCount = 0;

    for (const base of recurrentBases) {
      const alreadyExists = await this.db.select<any[]>(
        `SELECT _id
         FROM ${this.documentName}
         WHERE userId = $1
           AND recurrent = 1
           AND description = $2
           AND amount = $3
           AND (
             (categoryId IS NULL AND $4 IS NULL) OR
             categoryId = $4
           )
           AND strftime('%m', date)|| '/'||  strftime('%Y', date) = $5
         LIMIT 1`,
        [userId, base.description, base.amount, base.categoryId ?? null, monthToken]
      );

      if (alreadyExists.length > 0) {
        continue;
      }

      const sourceDay = this.getDayFromDate(base.lastDate);
      const targetDay = Math.min(sourceDay, this.getDaysInMonth(parsed.year, parsed.month));
      const targetDate = this.toIsoDate(parsed.year, parsed.month, targetDay);

      await this.db.execute(
        `INSERT INTO ${this.documentName} (_id, description, amount, date, userId, categoryId, recurrent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          crypto.randomUUID(),
          base.description,
          base.amount,
          targetDate,
          userId,
          base.categoryId ?? null,
          1,
        ]
      );

      generatedCount++;
    }

    return generatedCount;
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
    recurrent: string | undefined | null,
    search: string | undefined | null,
    minAmount: number | undefined | null,
    maxAmount: number | undefined | null,
    orderby?: string
  ): Promise<PagedList<ExpenseListModel>> {
    await this.loadDb();

    const recordsPerPage = 10;
    let offset = recordsPerPage * (pageIndex - 1);
    const whereClauses: string[] = ["expense.userId=$1"];
    const queryParams: any[] = [userId];

    if (onlyWithoutCategory) {
      whereClauses.push(`category._id is null`);
    }

    if (monthYear) {
      whereClauses.push(
        `strftime( '%m', date )|| '/'||  strftime('%Y', date)=$${queryParams.length + 1}`
      );
      queryParams.push(monthYear);
    }

    if (category) {
      whereClauses.push(`category._id =$${queryParams.length + 1}`);
      queryParams.push(category);
    }

    if (recurrent === "yes") {
      whereClauses.push(`expense.recurrent = 1`);
    }

    if (recurrent === "no") {
      whereClauses.push(`expense.recurrent = 0`);
    }

    if (search && search.trim().length > 0) {
      whereClauses.push(`LOWER(expense.description) LIKE LOWER($${queryParams.length + 1})`);
      queryParams.push(`%${search.trim()}%`);
    }

    if (minAmount !== null && minAmount !== undefined && !Number.isNaN(minAmount)) {
      whereClauses.push(`expense.amount >= $${queryParams.length + 1}`);
      queryParams.push(minAmount);
    }

    if (maxAmount !== null && maxAmount !== undefined && !Number.isNaN(maxAmount)) {
      whereClauses.push(`expense.amount <= $${queryParams.length + 1}`);
      queryParams.push(maxAmount);
    }

    let countsql =
      "SELECT count(*) as cont from expense Left JOIN  category" +
      " ON expense.categoryId = category._id where " +
      whereClauses.join(" and ");

    const responseCount = await this.db.select<any>(countsql, queryParams);

    let sql = ` SELECT  expense._id, expense.description, amount, date, category.description as category, expense.recurrent
    FROM
      ${this.documentName}    
     Left JOIN
        category ON expense.categoryId = category._id
     where
      ${whereClauses.join(" and ")}      
   `;

    if (orderby) {
      sql += ` order by ${orderby}`;
    }

    sql += `  LIMIT ${recordsPerPage} OFFSET ${offset}`;

    const response: ExpenseListModel[] = await this.db.select<
      ExpenseListModel[]
    >(sql, queryParams);

    let pagedResponse = {
      data: response,
      totalRecords: responseCount[0].cont,
    } as PagedList<ExpenseListModel>;

    return pagedResponse;
  }
}
