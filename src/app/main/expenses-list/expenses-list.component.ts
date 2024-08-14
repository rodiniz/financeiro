import { Component, inject } from "@angular/core";
import { Expense } from "../../../models/expense";
import { Router } from "@angular/router";
import { ExpenseService } from "../../../services/expense.service";
import { LucideAngularModule } from "lucide-angular";
import { ask, message, open } from "@tauri-apps/api/dialog";
import * as XLSX from "xlsx";
import { readBinaryFile } from "@tauri-apps/api/fs";

import { ExpenseListModel } from "../../../models/expenseListModel";
import { UsersService } from "../../../services/users.service";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: "app-expenses-list",
  standalone: true,
  imports: [LucideAngularModule, NgbPaginationModule],
  templateUrl: "./expenses-list.component.html",
  styleUrl: "./expenses-list.component.css",
})
export class ExpensesListComponent {
  expenses: ExpenseListModel[] = [];
  expenseService = inject(ExpenseService);
  userService = inject(UsersService);
  router = inject(Router);
  categories: any;
  userId = this.userService.getCurrentUser();
  importing = false;
  numberOfPages: Array<number> = [];
  activePage = 1;
  totalRecords = 0;
  async ngOnInit(): Promise<void> {
    this.importing = true;
    this.loadData();
    this.importing = false;
  }

  formatData(data: Date) {
    //2024-08-08
    return (
      data.toString().substring(8, 10) +
      "/" +
      data.toString().substring(5, 7) +
      "/" +
      data.toString().substring(0, 4)
    );
  }

  async loadData(pageIndex: number = 1) {
    this.activePage = pageIndex;
    let paged = await this.expenseService.getAllModel(
      this.userId as string,
      pageIndex,
      " date desc"
    );

    this.expenses = paged.data;

    this.totalRecords = paged.totalRecords;
  }
  redirectToCreate() {
    this.router.navigate(["/menu/createExpense"]);
  }
  redirectToEdit(id: string) {
    this.router.navigate(["/menu/editExpense", id]);
  }
  async delete(id: string) {
    const yes = await ask("Deseja mesmo excluir esse registro?", "Financeiro");
    if (yes) {
      await this.expenseService.delete(id);
      this.loadData();
    }
  }
  async removeAll() {
    const yes = await ask("Deseja mesmo excluir todas despesas?", "Financeiro");
    if (yes) {
      await this.expenseService.DeleteAll();
      this.loadData();
    }
  }
  excelSerialToDate(serial: number): Date {
    // Excel's epoch starts on January 1, 1900, which is 25569 in serial form
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // December 30, 1899

    // Adjust for Excel's leap year bug (February 29, 1900 should not exist)
    if (serial >= 60) {
      serial -= 1;
    }

    // Convert the serial to milliseconds (each serial day equals 86400000 ms)
    const milliseconds = serial * 86400000;

    // Calculate the adjusted date
    const date = new Date(excelEpoch.getTime() + milliseconds);

    return date;
  }
  async importExpenses() {
    const selected = await open({
      filters: [
        {
          name: "xslx",
          extensions: ["xlsx"],
        },
      ],
    });
    if (selected != null) {
      this.importing = true;
      const data = await readBinaryFile(selected as string);
      const workbook = XLSX.read(data, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the sheet data to JSON
      const jsonData: unknown[] = XLSX.utils.sheet_to_json(worksheet);

      for (let i = 0; i < jsonData.length; i++) {
        let row: any = jsonData[i];
        if (row["Valor"] < 0) {
          try {
            let expense = {
              _id: crypto.randomUUID(),
              date: this.excelSerialToDate(row["Data Valor"]),
              amount: row["Valor"] * -1,
              description: row["Descrição"],
              userId: this.userId,
            };
            var exists = await this.expenseService.Exists(expense);
            if (!exists) {
              await this.expenseService.create(expense);
            }
          } catch (e) {
            await message(`Erro ao importar ${e}`);
            this.importing = false;
            return;
          }
        }
      }
      await message("Despesas importadas com sucesso");
      this.importing = false;
      this.loadData();
    }
  }
}
