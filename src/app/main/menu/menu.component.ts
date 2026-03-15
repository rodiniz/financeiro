import { Component, inject } from "@angular/core";
import {
  Router,
  
  RouterModule,
  RouterOutlet,
} from "@angular/router";
import { UsersService } from "../../../services/users.service";
import { LucideAngularModule } from "lucide-angular";
import { message } from "@tauri-apps/plugin-dialog";
import { Sidebar } from "../sidebar/sidebar";
import { I18nService } from "../../i18n/i18n.service";

@Component({
    selector: "app-men",
    imports: [
        RouterModule,
        RouterOutlet,       
        LucideAngularModule,
        Sidebar
    ],
    templateUrl: "./menu.component.html",
    styleUrl: "./menu.component.css"
})
export class MenuComponent {
  userService = inject(UsersService);
  i18n = inject(I18nService);
  constructor() {}
  router = inject(Router);
  
  toggleLanguage() {
    const newLang = this.i18n.language() === 'pt' ? 'en' : 'pt';
    this.i18n.setLanguage(newLang);
  }
  
  goToLogin() {
    this.userService.cleanUpUser();
    this.router.navigate([""]);
  }
  async backupDatabase() {
    try {
      await this.userService.backup();
      
    } catch (error) {        
      await message(`${this.i18n.t('common.error')} ${this.i18n.t('menu.backupError')} ${error}`, { kind: "error" });
    }
  }
  async restoreDatabase() {
    try {
      await this.userService.restore();
     
    } catch (error) {
      await message(`${this.i18n.t('common.error')} ${this.i18n.t('menu.restoreError')} ${error}`, { kind: "error" });
    }
  }
}
