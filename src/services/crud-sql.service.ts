import { Injectable } from "@angular/core";
import Database from "tauri-plugin-sql-api";
import keys from "lodash/keys";
import { map, values } from "lodash";
import { message } from "@tauri-apps/api/dialog";
@Injectable({
  providedIn: "root",
})
export abstract class CrudSqlService<T> {
  protected db!: Database;
  protected documentName: string | undefined;
  constructor() {}
  async loadDb() {
    this.db = await Database.load("sqlite:financeiro.db");
  }
  async delete(id: String): Promise<void> {
    await this.loadDb();
    let response = await this.db.execute(
      `DELETE FROM ${this.documentName}      
      WHERE _id = $1
      `,
      [id]
    );
    if (response["rowsAffected"] != 1) {
      await message(JSON.stringify(response), { type: "error" });
    }
  }
  async create(model: Record<any, any>): Promise<void> {
    await this.loadDb();
    const response = await this.db.execute(
      `INSERT INTO ${this.documentName} (${keys(model).join(
        ", "
      )}) VALUES (${map(values(model), (_key, index) => `$${index + 1}`).join(
        ", "
      )})`,
      values(model)
    );
    if (response["rowsAffected"] != 1) {
      await message(JSON.stringify(response), { type: "error" });
    }
  }

  async update(id: string, model: Record<any, any>): Promise<void> {
    await this.loadDb();
    const setValues = map(
      keys(model),
      (key, index) => `${key} = $${index + 1}`
    ).join(", ");
    const sql = `UPDATE ${this.documentName} SET ${setValues} WHERE _id = $${
      keys(model).length + 1
    }`;
    let arrUpdate = [...values(model), id];

    const response = await this.db.execute(sql, arrUpdate);
    if (response["rowsAffected"] != 1) {
      await message(JSON.stringify(response), { type: "error" });
    }
  }
  async get(model: Record<any, any>): Promise<T[]> {
    await this.loadDb();
    let where = map(
      keys(model),
      (_key, index) =>
        `
      ${_key}=$${index + 1}
    `
    );
    let sql = `
    SELECT
      *
    FROM
      ${this.documentName}
    WHERE
      ${where}
    `;
    const response: any = await this.db.select<T[]>(sql, [
      values(model).join(", "),
    ]);
    return response;
  }
  async getById(id: string): Promise<T> {
    await this.loadDb();
    const response: any = await this.db.select<T>(
      `
      SELECT
        *
      FROM
        ${this.documentName}
      WHERE
        _id = $1   
      LIMIT 1   
      `,
      [id]
    );
    return Array.isArray(response) ? response[0] : response;
  }
  async getAll(orderby?: string): Promise<T[]> {
    await this.loadDb();
    let sql = ` SELECT
      *
    FROM
      ${this.documentName}    
   `;
    if (orderby) {
      sql += ` order by ${orderby}`;
    }
    const response: T[] = await this.db.select<T[]>(sql);
    return response;
  }
}
