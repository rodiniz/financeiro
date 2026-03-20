import { Component, inject, OnInit, signal } from "@angular/core";
import { CategoryService } from "../../../services/category.service";
import { Category } from "../../../models/category";
import { LucideAngularModule } from "lucide-angular";
import { Router } from "@angular/router";
import { ask } from "@tauri-apps/plugin-dialog";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardTableComponent, ZardTableBodyComponent, ZardTableRowComponent } from "@shared/components/table/table.component";
import { I18nService } from "../../i18n/i18n.service";

@Component({
    selector: "app-categorylist",
    imports: [LucideAngularModule,
    ZardButtonComponent,
    ZardTableComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent],
    templateUrl: "./categorylist.component.html",
    styleUrl: "./categorylist.component.css"
})
export class CategorylistComponent implements OnInit {
  categorys = signal<Category[]>([]);
  categoryService = inject(CategoryService);
  router = inject(Router);
  i18n = inject(I18nService);
  async ngOnInit(): Promise<void> {
    const categories = await this.categoryService.getAll(
      "description  COLLATE NOCASE ASC"
    );
    this.categorys.set(categories);
  }   
  
  redirectToCreate() {
    this.router.navigate(["/menu/createCategory"]);
  }
  redirectToEdit(id: string) {
    this.router.navigate(["/menu/editCategory", id]);
  }
  async deleteCategory(id: string) {
    const yes = await ask(this.i18n.t('categories.list.deleteConfirm'), this.i18n.t('app.title'));
    if (yes) {
      await this.categoryService.delete(id);
      const categories = await this.categoryService.getAll(
        "description  COLLATE NOCASE ASC"
      );
      this.categorys.set(categories);
   
    }
  }
}
