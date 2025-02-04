import { Component, inject, OnInit } from "@angular/core";
import { CategoryService } from "../../../services/category.service";
import { Category } from "../../../models/category";
import { LucideAngularModule } from "lucide-angular";
import { Router } from "@angular/router";
import { ask } from "@tauri-apps/plugin-dialog";

@Component({
  selector: "app-categorylist",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./categorylist.component.html",
  styleUrl: "./categorylist.component.css",
})
export class CategorylistComponent implements OnInit {
  categories: Category[] = [];
  categoryService = inject(CategoryService);
  router = inject(Router);
  async ngOnInit(): Promise<void> {
    this.categories = await this.categoryService.getAll(
      "description  COLLATE NOCASE ASC"
    );
  }
  redirectToCreate() {
    this.router.navigate(["/menu/createCategory"]);
  }
  redirectToEdit(id: string) {
    this.router.navigate(["/menu/editCategory", id]);
  }
  async delete(id: string) {
    const yes = await ask("Deseja mesmo excluir esse registro?", "Financeiro");
    if (yes) {
      await this.categoryService.delete(id);
      this.categories = await this.categoryService.getAll();
    }
  }
}
