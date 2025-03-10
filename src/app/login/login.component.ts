import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule, RouterOutlet } from "@angular/router";
import { UsersService } from "../../services/users.service";
import { message } from "@tauri-apps/plugin-dialog";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  email = new FormControl("");
  password = new FormControl("");
  private router = inject(Router);
  userService = inject(UsersService);

  async onSubmit() {
    const user = await this.userService.get({ email: this.email.value });
   
    if (user && user.length > 0) {
      if (user[0].password != this.password.value) {
        await message("Usuário ou senha inválidos", { kind: "error" });
        return;
      }
      this.userService.setCurrentUser(user[0]._id);
      this.router.navigate(["menu"]);
    } else {
      await message("Usuário ou senha inválidos", { kind: "error" });
    }
  }
}
