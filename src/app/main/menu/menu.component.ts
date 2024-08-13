import { Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from "@angular/router";
import { UsersService } from "../../../services/users.service";

@Component({
  selector: "app-men",
  standalone: true,
  imports: [RouterModule, RouterOutlet, RouterLink, RouterLinkActive],
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
}
