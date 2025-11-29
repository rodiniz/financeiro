
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { UsersService } from "../../services/users.service";
import { message } from "@tauri-apps/plugin-dialog";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardCardComponent } from "@shared/components/card/card.component";
import { ZardInputDirective } from "@shared/components/input/input.directive";
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from "@shared/components/form/form.component";

@Component({
    selector: "app-login",
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
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.css"
})
export class LoginComponent {

  private router = inject(Router);
  userService = inject(UsersService);
  protected readonly isLoading = signal(false);
  protected readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });
  async onSubmit() {
    const user = await this.userService.get({ email: this.loginForm.get('email')?.value });
   
    if (user && user.length > 0) {
      if (user[0].password != this.loginForm.get('password')?.value) {
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
