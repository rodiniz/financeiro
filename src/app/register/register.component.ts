import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UsersService } from "../../services/users.service";

import {  RouterModule, Router } from "@angular/router";
import { message } from "@tauri-apps/plugin-dialog";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardCardComponent } from "@shared/components/card/card.component";
import { ZardFormFieldComponent, ZardFormLabelComponent, ZardFormControlComponent } from "@shared/components/form/form.component";
import { ZardInputDirective } from "@shared/components/input/input.directive";

@Component({
    selector: "app-register",
    imports: [  
    FormsModule,
    ReactiveFormsModule,
    RouterModule,    
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
],
    templateUrl: "./register.component.html",
    styleUrl: "./register.component.css"
})
export class RegisterComponent {
   protected readonly isLoading = signal(false);
  protected readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });
  private router = inject(Router);
  userService = inject(UsersService);

  async onSubmit() {
    
    this.isLoading.set(true);
    await this.userService.create({
      _id: crypto.randomUUID(),
      email: this.loginForm.get("email")?.value || "",
      password: this.loginForm.get("password")?.value || "",
    });
    await message("Usuário criado com sucesso", "Financeiro");
    this.router.navigate([""]);
  }
  gotoLogin() {
    this.router.navigate([""]);
  }
}
