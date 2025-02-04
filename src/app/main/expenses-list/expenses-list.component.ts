import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ExpenseService } from "../../../services/expense.service";
import { LucideAngularModule } from "lucide-angular";
import { ask, message, open } from "@tauri-apps/plugin-dialog";
import * as XLSX from "xlsx";


import { ExpenseListModel } from "../../../models/expenseListModel";
import { UsersService } from "../../../services/users.service";
import {
  NgbPaginationModule,
  NgbProgressbarModule,
} from "@ng-bootstrap/ng-bootstrap";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartService } from "../../../services/chart.service";
import { CurrencyPipe } from "@angular/common";
import { CategoryService } from "../../../services/category.service";
import {readFile} from "@tauri-apps/plugin-fs";
import { IncomeService } from "../../../services/income.service";
import {Income} from "../../../models/income";
import {Expense} from "../../../models/expense";
@Component({
  selector: "app-expenses-list",
  standalone: true,
  imports: [
    LucideAngularModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
  ],
  templateUrl: "./expenses-list.component.html",
  styleUrl: "./expenses-list.component.css",
})
export class ExpensesListComponent {
  expenses: ExpenseListModel[] = [];
  incomeService=inject(IncomeService);
  expenseService = inject(ExpenseService);
  userService = inject(UsersService);
  chartService = inject(ChartService);
  categorieService= inject(CategoryService);
  router = inject(Router); 
  userId = this.userService.getCurrentUser();
  importing = false;
  activePage = 1;
  totalRecords = 0;
  percentageCompleted = 0;
  onlyWithoutCategory = new FormControl<boolean>(false);
  monthYear = new FormControl("");
  monthYears: Array<any> = [];
  category= new FormControl(null);
  categories: any = [];
  async ngOnInit(): Promise<void> {
    this.monthYears = await this.chartService.getChartMonthYears();
    this.categories = await this.categorieService.getAll("description  COLLATE NOCASE ASC");
    if (this.monthYears.length > 0) {
      this.monthYear.setValue(this.monthYears[this.monthYears.length - 1].monthYear);
    }
    this.importing = true;
    this.loadData(1);
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
      this.onlyWithoutCategory.value as boolean,
      this.monthYear.value,
      this.category.value,
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
      this.loadData(1);
    }
  }
  async removeAll() {
    const yes = await ask("Deseja mesmo excluir todas despesas?", "Financeiro");
    if (yes) {
      await this.expenseService.DeleteAll();
      this.loadData(1);
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
      const data = await readFile(selected as string);
      const workbook = XLSX.read(data, { type: "buffer" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the sheet data to JSON
      const jsonData: unknown[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });
      let totalImport = jsonData.length; // percentage -- x-100
      let repeated=0;
      let imported = 0;
      //ignpre header row
      for (let i = 1; i < jsonData.length; i++) {
        this.percentageCompleted = Math.round((i * 100) / totalImport);        
        let row: any = jsonData[i];
        if(row.length ==0){
          break;
        }
        if (row[3] < 0) {
          try {
            let expense = {
              _id: crypto.randomUUID(),
              date: this.excelSerialToDate(row[0]),
              amount: row[3] * -1,
              description: row[2],
              userId: this.userId,
            } as Expense;
            var exists = await this.expenseService.Exists(expense);
            if (!exists) {
              imported++;
              await this.expenseService.create(expense);
            }
            else {
              repeated++;
            }
          } catch (e) {
            await message(`Erro ao importar ${e}`);
            this.importing = false;
            return;
          }
        }
        else{
          let income = {
            _id: crypto.randomUUID(),
            date: this.excelSerialToDate(row[0]),
            amount: row[3],         
            userId: this.userId,
          } as Income;
          var exists = await this.incomeService.Exists(income);
          if (!exists) {
            await this.incomeService.create(income);
          }
        }
      }
      this.percentageCompleted = 0;
      await message(` ${imported} Despesas importadas. ${repeated} despesas repetidas`);
      this.importing = false;
      this.loadData();
    }
  }
}
