import { Component, inject } from "@angular/core";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UsersService } from "../../services/users.service";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import { message } from "@tauri-apps/plugin-dialog";
import { ErrorMessageComponent } from "../main/error-message/error-message.component";

@Component({
    selector: "app-register",
    imports: [
        CommonModule,
        RouterOutlet,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ErrorMessageComponent,
    ],
    templateUrl: "./register.component.html",
    styleUrl: "./register.component.css"
})
export class RegisterComponent {
  email = new FormControl("", Validators.required);
  password = new FormControl("", Validators.required);
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
  gotoLogin() {
    this.router.navigate([""]);
  }
}
