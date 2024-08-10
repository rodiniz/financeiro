import { Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from "@angular/router";

@Component({
  selector: "app-men",
  standalone: true,
  imports: [RouterModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./menu.component.html",
  styleUrl: "./menu.component.css",
})
export class MenuComponent {
  constructor() {}
  router = inject(Router);
  goToLogin() {
    localStorage.removeItem("userId");
    this.router.navigate([""]);
  }
}
