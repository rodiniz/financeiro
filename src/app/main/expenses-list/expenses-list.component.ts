import {Component, effect, inject, signal} from "@angular/core";
import {Router} from "@angular/router";
import {ExpenseService} from "../../../services/expense.service";
import {LucideAngularModule} from "lucide-angular";
import {ask, message, open} from "@tauri-apps/plugin-dialog";
import * as Excel from "xlsx";
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
import { ZardPaginationComponent } from "@shared/components/pagination/pagination.component";
import { I18nService } from "../../i18n/i18n.service";
import { FilterStorageService } from "../../services/filter-storage.service";

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
        ZardTableRowComponent,
        ZardPaginationComponent
    ],
    templateUrl: "./expenses-list.component.html",
    styleUrl: "./expenses-list.component.css"
})
export class ExpensesListComponent {
  expenses = signal<ExpenseListModel[]>([]);
  recurrentToastMessage = signal<string | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  incomeService=inject(IncomeService);
  expenseService = inject(ExpenseService);
  userService = inject(UsersService);
  chartService = inject(ChartService);
  categorieService= inject(CategoryService);
  router = inject(Router); 
  i18n = inject(I18nService);
  filterStorage = inject(FilterStorageService);
  userId = this.userService.getCurrentUser();
  importing = signal(false);
  activePage = signal(1);
  totalRecords = signal(0);
  percentageCompleted = 0;
  onlyWithoutCategory = new FormControl<boolean>(false);
  onlyWithoutCategorySignal = signal(this.onlyWithoutCategory.value ?? false);
  monthYear = new FormControl("");
  monthYears: Array<any> = [];
  category= new FormControl<string | null>(null);
  recurrent = new FormControl<string>('all');
  search = new FormControl<string>('');
  minAmount = new FormControl<number | null>(null);
  maxAmount = new FormControl<number | null>(null);
  categories: any = [];

  constructor() {
    this.onlyWithoutCategory.valueChanges.subscribe(value => {
      this.onlyWithoutCategorySignal.set(value ?? false);
      this.filterStorage.setFilters({ onlyWithoutCategory: value ?? false });
    });
    this.monthYear.valueChanges.subscribe(value => {
      this.filterStorage.setFilters({ monthYear: value });
    });
    this.category.valueChanges.subscribe(value => {
      this.filterStorage.setFilters({ category: value });
    });
    this.recurrent.valueChanges.subscribe(value => {
      this.filterStorage.setFilters({ recurrent: value });
    });
    this.search.valueChanges.subscribe(value => {
      this.filterStorage.setFilters({ search: value });
    });
    this.minAmount.valueChanges.subscribe(value => {
      this.filterStorage.setFilters({ minAmount: value });
    });
    this.maxAmount.valueChanges.subscribe(value => {
      this.filterStorage.setFilters({ maxAmount: value });
    });
    effect(() => {
      this.onlyWithoutCategory.setValue(this.onlyWithoutCategorySignal(), { emitEvent: false });
    });
  }
  async ngOnInit(): Promise<void> {
    this.monthYears = await this.chartService.getChartMonthYears();
    this.categories = await this.categorieService.getAll("description  COLLATE NOCASE ASC");
    
    const savedFilters = this.filterStorage.getFilters();
    
    if (savedFilters.monthYear && savedFilters.monthYear !== '') {
      this.monthYear.setValue(savedFilters.monthYear);
    } else if (this.monthYears.length > 0) {
      this.monthYear.setValue(this.monthYears[this.monthYears.length - 1].monthYear);
    }
    
    if (savedFilters.category && savedFilters.category !== '') {
      this.category.setValue(savedFilters.category);
    }

    if (savedFilters.recurrent && savedFilters.recurrent !== '') {
      this.recurrent.setValue(savedFilters.recurrent);
    }

    if (savedFilters.search && savedFilters.search !== '') {
      this.search.setValue(savedFilters.search);
    }

    if (savedFilters.minAmount !== null && savedFilters.minAmount !== undefined) {
      this.minAmount.setValue(savedFilters.minAmount);
    }

    if (savedFilters.maxAmount !== null && savedFilters.maxAmount !== undefined) {
      this.maxAmount.setValue(savedFilters.maxAmount);
    }
    
    if (savedFilters.onlyWithoutCategory) {
      this.onlyWithoutCategory.setValue(savedFilters.onlyWithoutCategory);
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
    this.activePage.set(pageIndex);

    const generated = await this.expenseService.ensureRecurrentExpensesForMonth(
      this.userId as string,
      this.monthYear.value || undefined
    );

    if (generated > 0) {
      this.showRecurrentToast(generated);
    }

    let paged = await this.expenseService.getAllModel(
      this.userId as string,
      pageIndex,
      this.onlyWithoutCategorySignal(),
      this.monthYear.value || undefined,
      this.category.value as any,
      this.recurrent.value,
      this.search.value,
      this.minAmount.value,
      this.maxAmount.value,
      " date desc"
    );

    this.expenses.set(paged.data);

    this.totalRecords.set(paged.totalRecords);
  }

  showRecurrentToast(generated: number) {
    this.recurrentToastMessage.set(`${this.i18n.t('expenses.list.recurrentGenerated')}: ${generated}`);

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.recurrentToastMessage.set(null);
      this.toastTimeout = null;
    }, 3000);
  }

  closeToast() {
    this.recurrentToastMessage.set(null);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }

  ngOnDestroy() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }

  async clearFilters() {
    const defaultMonthYear =
      this.monthYears.length > 0
        ? this.monthYears[this.monthYears.length - 1].monthYear
        : "";

    this.monthYear.setValue(defaultMonthYear, { emitEvent: false });
    this.category.setValue("", { emitEvent: false });
    this.recurrent.setValue("all", { emitEvent: false });
    this.search.setValue("", { emitEvent: false });
    this.minAmount.setValue(null, { emitEvent: false });
    this.maxAmount.setValue(null, { emitEvent: false });
    this.onlyWithoutCategorySignal.set(false);
    this.onlyWithoutCategory.setValue(false, { emitEvent: false });

    this.filterStorage.setFilters({
      monthYear: defaultMonthYear,
      category: "",
      recurrent: "all",
      search: "",
      minAmount: null,
      maxAmount: null,
      onlyWithoutCategory: false,
    });

    await this.loadData(1);
  }

  redirectToCreate() {
    this.router.navigate(["/menu/createExpense"]);
  }
  redirectToEdit(id: string) {
    this.router.navigate(["/menu/editExpense", id]);
  }
  async delete(id: string) {
    const yes = await ask(this.i18n.t('expenses.list.deleteConfirm'), this.i18n.t('app.title'));
    if (yes) {
      await this.expenseService.delete(id);
      await this.loadData(1);
    }
  }
  async removeAll() {
    const yes = await ask(this.i18n.t('expenses.list.deleteAllConfirm'), this.i18n.t('app.title'));
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
      try {
        
        const data = await readFile(selected as string);
        if (!data || data.length === 0) {
          await message(`${this.i18n.t('common.error')}: ${this.i18n.t('expenses.list.emptyFileError')}`, { title: this.i18n.t('common.error'), kind: 'error' });
          this.importing.set(false);
          return;
        }
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        
        const workbook = Excel.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData: any[][] = Excel.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        
        let totalImport = jsonData.length; // percentage -- x-100
        let repeated=0;
        let imported = 0;
        
        // Find first row with actual data values (non-empty date or amount)
        let startIndex = 0;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0 && (row[0] != null || row[3] != null)) {
            startIndex = i;
            break;
          }
        }
        
        // Process rows starting from first data row
        for (let i = startIndex; i < jsonData.length; i++) {
          this.percentageCompleted = Math.round((i * 100) / totalImport);        
          let row: any = jsonData[i];
          if(!row || row.length == 0 || (row[0] == null && row[3] == null)){
            continue;
          }
          if (row[3] < 0) {
            try {
              let expense = {
                _id: crypto.randomUUID(),
                date: this.excelSerialToDate(row[0]),
                amount: row[3] * -1,
                description: row[2],
                userId: this.userId,
                recurrent: false,
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
              await message(`${this.i18n.t('common.error')}: ${e}`);
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
        await message(`${imported} ${this.i18n.t('expenses.list.imported')}. ${repeated} ${this.i18n.t('expenses.list.repeated')}`);
        this.importing.set(false);
        await this.loadData();
      } catch (error) {
        this.importing.set(false);
        console.error("Error importing file:", error);
        await message(`${this.i18n.t('common.error')}: ${error}`);
      }
    }
  }
}
