import { inject, Injectable } from "@angular/core";
import { User } from "../models/User";
import { CrudSqlService } from "./crud-sql.service";
import { LocalStorageToken } from "../app/tokens/localStorageToken";

@Injectable({
  providedIn: "root",
})
export class UsersService extends CrudSqlService<User> {
  storage = inject(LocalStorageToken);
  constructor() {
    super();
    this.documentName = "user";
  }
  setCurrentUser(id: string) {
    this.storage.setItem("userId", id);
  }
  getCurrentUser() {
    return this.storage.getItem("userId");
  }
  cleanUpUser() {
    this.storage.removeItem("userId");
  }
}
