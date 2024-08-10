import { Component, inject } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UsersService } from "../../services/users.service";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import { message } from "@tauri-apps/api/dialog";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent {
  email = new FormControl("");
  password = new FormControl("");
  private router = inject(Router);
  userService = inject(UsersService);

  async onSubmit() {
    await this.userService.create({
      _id: crypto.randomUUID(),
      email: this.email.value,
      password: this.password.value,
    });
    await message("Usuário criado com sucesso", "Financeiro");
    this.router.navigate([""]);
  }
}
