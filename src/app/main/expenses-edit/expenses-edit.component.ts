import { Component, inject, Input } from "@angular/core";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CategoryService } from "../../../services/category.service";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ExpenseService } from "../../../services/expense.service";
import { Category } from "../../../models/category";
import { ErrorMessageComponent } from "../error-message/error-message.component";
import { UsersService } from "../../../services/users.service";

@Component({
    selector: "app-expenses-edit",
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ErrorMessageComponent,
    ],
    templateUrl: "./expenses-edit.component.html",
    styleUrl: "./expenses-edit.component.css"
})
export class ExpensesEditComponent {
  @Input() id = "";
  categoryService = inject(CategoryService);
  description = new FormControl("", Validators.required);
  amount = new FormControl(0, Validators.required);
  date = new FormControl("", Validators.required);
  category = new FormControl("", Validators.required);
  router = inject(Router);
  expenseService = inject(ExpenseService);
  categories: Category[] = [];
  userService = inject(UsersService);

  async ngOnInit(): Promise<void> {
    this.categories = await this.categoryService.getAll('description  COLLATE NOCASE ASC');
    if (this.id && this.id.length > 0) {
      let expense = await this.expenseService.getById(this.id);
      this.description.setValue(expense.description);
      this.amount.setValue(expense.amount);
      this.date.setValue(this.formatData(expense.date));

      if (expense.categoryId) {
        this.category.setValue(expense.categoryId);
      }
    }
  }
  gotoList() {
    this.router.navigate(["/menu/listExpenses"]);
  }
  async onsubmit() {
    const expense: any = {
      date: this.date.value,
      amount: this.amount.value,
      description: this.description.value,
      userId: this.userService.getCurrentUser(),
      categoryId: this.category.value,
    };

    if (this.id && this.id.length > 0) {
      await this.autoCategory(expense.categoryId);
      this.router.navigate(["/menu/listExpenses"]);
    } else {
      expense._id = crypto.randomUUID();
      await this.expenseService.create(expense);
      this.router.navigate(["/menu/listExpenses"]);
    }
  }
  formatData(data: Date | string) {
    if (typeof data === "string") {
      if (data.indexOf("T00:00:00.000Z") !== -1) {
        data = data.replace("T00:00:00.000Z", "");
        let dt = data.split("-");
        return `${dt[2]}/${dt[1]}/${dt[0]}`;
      }
      return data;
    }
    return data.toISOString();
  }

  async autoCategory(cat: string) {
    const filter = { description: this.description.value };
    var expenses = await this.expenseService.get(filter);

    expenses.forEach(async (element) => {
      let expenseEdit = {
        date: element.date,
        amount: element.amount,
        description: element.description,
        userId: this.userService.getCurrentUser(),
        categoryId: cat,
      };
      await this.expenseService.update(element._id, expenseEdit);
    });
  }
}
