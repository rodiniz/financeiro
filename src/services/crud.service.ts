import { Injectable } from "@angular/core";
import { message } from "@tauri-apps/api/dialog";
import { fetch, Body, ResponseType } from "@tauri-apps/api/http";

@Injectable({
  providedIn: "root",
})
export class CrudService<T> {
  protected documentName: string | undefined;
  protected apikey = "16f4f12edab2c3a60669903c71317eb1a20cf";

  protected getHeaders(): Record<string, any> {
    return {
      "cache-control": "no-cache",
      "x-apikey": this.apikey,
      "content-type": "application/json",
    };
  }
  async create(model: Record<any, any>): Promise<void> {
    const response = await fetch(
      `https://financeiro-34ba.restdb.io/rest/${this.documentName}`,
      {
        method: "POST",
        timeout: 30,
        responseType: ResponseType.JSON,
        body: Body.json(model),
        headers: this.getHeaders(),
      }
    );
    if (response.status === 500 || response.status === 400) {
      throw new Error(JSON.stringify(response));
    }
  }

  async update(id: String, model: Record<any, any>): Promise<void> {
    const response = await fetch(
      `https://financeiro-34ba.restdb.io/rest/${this.documentName}/${id}`,
      {
        method: "PUT",
        timeout: 30,
        responseType: ResponseType.JSON,
        body: Body.json(model),
        headers: this.getHeaders(),
      }
    );
    if (response.status !== 200) {
      await message(JSON.stringify(response.data), { type: "error" });
    }
  }
  async delete(id: String): Promise<void> {
    const response = await fetch(
      `https://financeiro-34ba.restdb.io/rest/${this.documentName}/${id}`,
      {
        method: "DELETE",
        timeout: 30,
        responseType: ResponseType.JSON,
        headers: this.getHeaders(),
      }
    );
    if (response.status !== 200) {
      await message(JSON.stringify(response.data), { type: "error" });
    }
  }

  async get(model: Record<any, any>): Promise<T[]> {
    const url = encodeURI(JSON.stringify(model));
    const response = await fetch(
      `https://financeiro-34ba.restdb.io/rest/${this.documentName}?q=${url}`,
      {
        method: "GET",
        timeout: 30,
        responseType: ResponseType.JSON,
        headers: this.getHeaders(),
      }
    );
    return response.data as T[];
  }
  async getById(id: string): Promise<T> {
    const response = await fetch(
      `https://financeiro-34ba.restdb.io/rest/${this.documentName}/${id}`,
      {
        method: "GET",
        timeout: 30,
        responseType: ResponseType.JSON,
        headers: this.getHeaders(),
      }
    );
    return response.data as T;
  }
  async getAll(): Promise<T[]> {
    const response = await fetch(
      `https://financeiro-34ba.restdb.io/rest/${this.documentName}`,
      {
        method: "GET",
        timeout: 30,
        responseType: ResponseType.JSON,
        headers: this.getHeaders(),
      }
    );
    return response.data as T[];
  }
}
