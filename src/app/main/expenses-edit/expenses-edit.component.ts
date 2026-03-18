import { Component, inject, Input, signal } from "@angular/core";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CategoryService } from "../../../services/category.service";
import { Router, RouterModule } from "@angular/router";

import { ExpenseService } from "../../../services/expense.service";
import { Category } from "../../../models/category";
import { ErrorMessageComponent } from "../error-message/error-message.component";
import { UsersService } from "../../../services/users.service";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardCardComponent } from "@shared/components/card/card.component";
import { ZardFormModule } from "@shared/components/form/form.module";
import { ZardInputDirective } from "@shared/components/input/input.directive";
import { ZardDatePickerComponent } from "@shared/components/date-picker/date-picker.component";
import { ZardSelectComponent } from "@shared/components/select/select.component";
import { ZardSelectItemComponent } from "@shared/components/select/select-item.component";
import { I18nService } from "../../i18n/i18n.service";

@Component({
    selector: "app-expenses-edit",
    imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ZardCardComponent, 
    ZardButtonComponent,
    ZardFormModule,
    ZardInputDirective,
    ZardDatePickerComponent  
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
  recurrent = new FormControl(false, { nonNullable: true });
  idControl = new FormControl("");
  router = inject(Router);
  expenseService = inject(ExpenseService);
  categories: Category[] = [];
  userService = inject(UsersService);
  i18n = inject(I18nService);
  isSubmiting=signal(false);
  isEditing=signal(false);
  selectedDate=signal<Date | null>(null);
  
  async ngOnInit(): Promise<void> {

    this.categories = await this.categoryService.getAll('description  COLLATE NOCASE ASC');
    if (this.id && this.id.length > 0) {
      this.isEditing.set(true);
      let expense = await this.expenseService.getById(this.id);
      this.idControl.setValue(expense._id);
      this.description.setValue(expense.description);
      this.amount.setValue(expense.amount);
      const formattedDate = this.formatData(expense.date);
      this.date.setValue(formattedDate);
      this.selectedDate.set(new Date(expense.date));

      if (expense.categoryId) {
        this.category.setValue(expense.categoryId);
      }
      this.recurrent.setValue(Boolean(expense.recurrent));
    }
  }
  onDateChange(date: Date | null) {
    this.selectedDate.set(date);
    this.date.setValue(date ? this.formatData(date) : "");
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
      recurrent: this.recurrent.value
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
        recurrent: Boolean(element.recurrent),
      };
      await this.expenseService.update(element._id, expenseEdit);
    });
  }
}
