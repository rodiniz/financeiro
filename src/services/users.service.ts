import { inject, Injectable } from "@angular/core";
import { User } from "../models/User";
import { CrudSqlService } from "./crud-sql.service";
import { LocalStorageToken } from "../app/tokens/localStorageToken";
import { message, open,save } from '@tauri-apps/plugin-dialog';
import { copyFile } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

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
  async backup() {
    
      // Ask user where to save the backup
      const savePath = await save({
        filters: [{
          name: 'SQLite Database',
          extensions: ['db']
        }],
        defaultPath: 'financeiro_backup.db'
      });
   
      if (savePath) {
        // Get the path to the current database file
        const appDataDirPath = await appDataDir();
        const dbPath = await join(appDataDirPath, 'financeiro.db');
        
        // Copy the database file to the selected location
        await copyFile(dbPath, savePath);
        await message('Backup realizado com sucesso', { kind: "info" });
      }   
    
  }
  async restore() {
    try {
        // Ask user for the path to the backup
        const filePath = await open({
          filters: [{
            name: 'SQLite Database',
            extensions: ['db']
          }],
          defaultPath: 'financeiro_backup.db',
          multiple: false
        });
        if (filePath) {
          // Copy the backup file to the current database location
          const appDataDirPath = await appDataDir();
          const dbPath = await join(appDataDirPath, 'financeiro.db');
          await copyFile(filePath as string, dbPath);
          await message('Banco restaurado com sucesso', { kind: "info" });
        }
      }
    catch (error) {
      console.error('Failed to backup database:', error);
      throw error;
    }
  }
}
