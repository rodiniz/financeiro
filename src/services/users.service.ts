import { Injectable } from "@angular/core";
import { User } from "../models/User";
import { CrudSqlService } from "./crud-sql.service";

@Injectable({
  providedIn: "root",
})
export class UsersService extends CrudSqlService<User> {
  constructor() {
    super();
    this.documentName = "user";
  }
}
