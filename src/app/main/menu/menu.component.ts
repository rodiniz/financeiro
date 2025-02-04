import { Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from "@angular/router";
import { UsersService } from "../../../services/users.service";
import { LucideAngularModule } from "lucide-angular";
import { message } from "@tauri-apps/plugin-dialog";

@Component({
  selector: "app-men",
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
  ],
  templateUrl: "./menu.component.html",
  styleUrl: "./menu.component.css",
})
export class MenuComponent {
  userService = inject(UsersService);
  constructor() {}
  router = inject(Router);
  goToLogin() {
    this.userService.cleanUpUser();
    this.router.navigate([""]);
  }
  async backupDatabase() {
    try {
      await this.userService.backup();
      await message('Backup realizado com sucesso', { kind: "info" });
    } catch (error) {        
      await message(`Erro ao fazer backup do banco de dados ${error}`, { kind: "error" });
    }
  }
  async restoreDatabase() {
    try {
      await this.userService.restore();
      await message('Banco restaurado com sucesso', { kind: "info" });
    } catch (error) {
      await message(`Erro ao restaurar banco de dados ${error}`, { kind: "error" });
    }
  }
}
