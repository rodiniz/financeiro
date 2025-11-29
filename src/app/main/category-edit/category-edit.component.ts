
import { Component, inject, Input, OnInit } from "@angular/core";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CategoryService } from "../../../services/category.service";
import { ErrorMessageComponent } from "../error-message/error-message.component";

@Component({
    selector: "app-category-edit",
    imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ErrorMessageComponent
],
    templateUrl: "./category-edit.component.html",
    styleUrl: "./category-edit.component.css"
})
export class CategoryEditComponent implements OnInit {
  @Input() id = "";
  categoryService = inject(CategoryService);
  description = new FormControl("", Validators.required);
  router = inject(Router);

  async ngOnInit(): Promise<void> {
    if (this.id && this.id.length > 0) {
      let category = await this.categoryService.getById(this.id);
      this.description.setValue(category.description);
    }
  }
  gotoList() {
    this.router.navigate(["/menu/listCategories"]);
  }
  onsubmit() {
    if (this.id && this.id.length > 0) {
      this.categoryService
        .update(this.id, { Description: this.description.value })
        .then(() => {
          this.router.navigate(["/menu/listCategories"]);
        });
    } else {
      this.categoryService
        .create({
          _id: crypto.randomUUID(),
          description: this.description.value,
        })
        .then(() => {
          this.router.navigate(["/menu/listCategories"]);
        });
    }
  }
}
