import {Component, effect, inject, signal} from "@angular/core";
import {Router} from "@angular/router";
import {ExpenseService} from "../../../services/expense.service";
import {LucideAngularModule} from "lucide-angular";
import {ask, message, open} from "@tauri-apps/plugin-dialog";
import * as Excel from "exceljs";
import {ExpenseListModel} from "../../../models/expenseListModel";
import {UsersService} from "../../../services/users.service";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChartService} from "../../../services/chart.service";
import {CurrencyPipe} from "@angular/common";
import {CategoryService} from "../../../services/category.service";
import {readFile} from "@tauri-apps/plugin-fs";
import {IncomeService} from "../../../services/income.service";
import {Income} from "../../../models/income";
import {Expense} from "../../../models/expense";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardTableComponent, ZardTableBodyComponent, ZardTableRowComponent } from "@shared/components/table/table.component";

@Component({
    selector: "app-expenses-list",
    imports: [
        LucideAngularModule,        
        FormsModule,
        ReactiveFormsModule,
        CurrencyPipe,
        LucideAngularModule,
        ZardButtonComponent,
        ZardTableComponent,
        ZardTableBodyComponent,
        ZardTableRowComponent
    ],
    templateUrl: "./expenses-list.component.html",
    styleUrl: "./expenses-list.component.css"
})
export class ExpensesListComponent {
  expenses = signal<ExpenseListModel[]>([]);
  incomeService=inject(IncomeService);
  expenseService = inject(ExpenseService);
  userService = inject(UsersService);
  chartService = inject(ChartService);
  categorieService= inject(CategoryService);
  router = inject(Router); 
  userId = this.userService.getCurrentUser();
  importing = signal(false);
  activePage = 1;
  totalRecords = 0;
  percentageCompleted = 0;
  onlyWithoutCategory = new FormControl<boolean>(false);
  onlyWithoutCategorySignal = signal(this.onlyWithoutCategory.value ?? false);
  monthYear = new FormControl("");
  monthYears: Array<any> = [];
  category= new FormControl(null);
  categories: any = [];

  constructor() {
    this.onlyWithoutCategory.valueChanges.subscribe(value => this.onlyWithoutCategorySignal.set(value??false));
    effect(() => {
      this.onlyWithoutCategory.setValue(this.onlyWithoutCategorySignal(), { emitEvent: false });
    });
  }
  async ngOnInit(): Promise<void> {
    this.monthYears = await this.chartService.getChartMonthYears();
    this.categories = await this.categorieService.getAll("description  COLLATE NOCASE ASC");
    if (this.monthYears.length > 0) {
      this.monthYear.setValue(this.monthYears[this.monthYears.length - 1].monthYear);
    }
    this.importing.set(true);
    await this.loadData(1);
    this.importing.set(false);
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
      this.onlyWithoutCategorySignal(),
      this.monthYear.value,
      this.category.value,
      " date desc"
    );

    this.expenses.set(paged.data);

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
      await this.loadData(1);
    }
  }
  async removeAll() {
    const yes = await ask("Deseja mesmo excluir todas despesas e receitas?", "Financeiro");
    if (yes) {
      await this.expenseService.DeleteAll();
      await this.incomeService.DeleteAll();
      await this.loadData(1);
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
    return new Date(excelEpoch.getTime() + milliseconds);
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
      this.importing.set(true);
      const data = await readFile(selected as string);
      
      // Load workbook using ExcelJS
      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(data.buffer);

      const worksheet = workbook.worksheets[0];

      // Convert the sheet data to array format (similar to xlsx)
      const jsonData: unknown[] = [];
      worksheet.eachRow((row, rowNumber) => {
        const rowData: any[] = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowData.push(cell.value);
        });
        jsonData.push(rowData);
      });
      
      let totalImport = jsonData.length; // percentage -- x-100
      let repeated=0;
      let imported = 0;
      //ignore header row
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
            const existsExpense = await this.expenseService.Exists(expense);
            if (!existsExpense) {
              imported++;
              await this.expenseService.create(expense);
            }
            else {
              repeated++;
            }
          } catch (e) {
            await message(`Erro ao importar ${e}`);
            this.importing.set(false);
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
          const exists = await this.incomeService.Exists(income);
          if (!exists) {
            await this.incomeService.create(income);
          }
        }
      }
      this.percentageCompleted = 0;
      await message(` ${imported} Despesas importadas. ${repeated} despesas repetidas`);
      this.importing.set(false);
      await this.loadData();
    }
  }
}
