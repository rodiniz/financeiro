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
    } catch (error) {
      console.error('Failed to backup database:', error);
    }
  }
  async restoreDatabase() {
    try {
      await this.userService.restore();
    } catch (error) {
      console.error('Failed to backup database:', error);
    }
  }
}
