import { Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";
import { message } from "@tauri-apps/plugin-dialog";
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
      await message(JSON.stringify(response), { kind: "error" });
    }
  }
  async create(model: Record<any, any>): Promise<void> {
    await this.loadDb();
    const valuesArray = Object.values(model);
    const response = await this.db.execute(
      `INSERT INTO ${this.documentName} (${Object.keys(model).join(
        ", "
      )}) VALUES (${valuesArray
        .map((_key, index) => `$${index + 1}`)
        .join(", ")})`,
      Object.values(model)
    );
    if (response["rowsAffected"] != 1) {
      await message(JSON.stringify(response), { kind: "error" });
    }
  }

  async update(id: string, model: Record<any, any>): Promise<void> {
    await this.loadDb();
    let keysArray = Object.keys(model);

    const setValues = keysArray
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const sql = `UPDATE ${this.documentName} SET ${setValues} WHERE _id = $${
      Object.keys(model).length + 1
    }`;
    let arrUpdate = [...Object.values(model), id];

    const response = await this.db.execute(sql, arrUpdate);
    if (response["rowsAffected"] != 1) {
      await message(JSON.stringify(response), { kind: "error" });
    }
  }
  async get(model: Record<any, any>): Promise<T[]> {
    await this.loadDb();
    let keysArray = Object.keys(model);
    let where = keysArray.map(
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
      Object.values(model).join(", "),
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
