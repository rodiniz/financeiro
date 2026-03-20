
import { Component, inject, Input, OnInit, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CategoryService } from "../../../services/category.service";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardCardComponent } from "@shared/components/card/card.component";
import { ZardFormModule } from "@shared/components/form/form.module";
import { ZardInputDirective } from "@shared/components/input/input.directive";
import { I18nService } from "../../i18n/i18n.service";


@Component({
    selector: "app-category-edit",
    imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ZardCardComponent, 
    ZardButtonComponent,
    ZardFormModule,
    ZardInputDirective
    
],
    templateUrl: "./category-edit.component.html",
    styleUrl: "./category-edit.component.css"
})
export class CategoryEditComponent implements OnInit {
  @Input() id = "";
  categoryService = inject(CategoryService);
  i18n = inject(I18nService);
  categoryForm= new FormGroup({    
    id: new FormControl<string>(this.id),
    name: new FormControl('', [Validators.required])
  });
  router = inject(Router);
  isEditing: boolean=false;
  isSubmiting=signal(false);
  get nameControl() {
    return this.categoryForm.get('name')!;
  }
  async ngOnInit(): Promise<void> {
    if (this.id && this.id.length > 0) {
      let category = await this.categoryService.getById(this.id);
      this.categoryForm.controls['name'].setValue(category.description);
    }
  }
  gotoList() {
    this.router.navigate(["/menu/listCategories"]);
  }
  onSubmit() {
    const description = this.categoryForm.get('name')?.value || '';
    if (this.id && this.id.length > 0) {
      this.categoryService
        .update(this.id, { Description: description })
        .then(() => {
          this.router.navigate(["/menu/listCategories"]);
        });
    } else {
      this.categoryService
        .create({
          _id: crypto.randomUUID(),
          description: description,
        })
        .then(() => {
          this.router.navigate(["/menu/listCategories"]);
        });
    }
  }
}
