import { Injectable } from "@angular/core";
import { Category } from "../models/category";
import { CrudSqlService } from "./crud-sql.service";

@Injectable({
  providedIn: "root",
})
export class CategoryService extends CrudSqlService<Category> {
  constructor() {
    super();
    this.documentName = "category";
  }
  override async getAll(orderby?: string): Promise<Category[]> {
    await this.loadDb();
    let sql = ` SELECT _id,description      
    FROM
      ${this.documentName}    
   `;
    if (orderby) {
      sql += ` order by ${orderby}`;
    }
    const response: Category[] = await this.db.select<Category[]>(sql);
    return response;
  }
}
