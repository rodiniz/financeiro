
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UsersService } from "../../services/users.service";
import { MonetaryVisibilityService } from "../../services/monetary-visibility.service";
import { message } from "@tauri-apps/plugin-dialog";
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardCardComponent } from "@shared/components/card/card.component";
import { ZardInputDirective } from "@shared/components/input/input.directive";
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from "@shared/components/form/form.component";
import { I18nService } from "../i18n/i18n.service";

@Component({
    selector: "app-login",
    imports: [    
    CommonModule,
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
  monetaryVisibilityService = inject(MonetaryVisibilityService);
  i18n = inject(I18nService);
  protected readonly isLoading = signal(false);
  
  toggleLanguage() {
    const newLang = this.i18n.language() === 'pt' ? 'en' : 'pt';
    this.i18n.setLanguage(newLang);
  }
  
  protected readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
    hideMonetaryValues: new FormControl(this.monetaryVisibilityService.isHidden()),
  });

  onHideMonetaryValuesChange() {
    const hideValues = this.loginForm.get('hideMonetaryValues')?.value ?? false;
    this.monetaryVisibilityService.toggleVisibility(hideValues);
  }

  async onSubmit() {
   
    const user = await this.userService.get({ email: this.loginForm.get('email')?.value });
   
    if (user && user.length > 0) {
      if (user[0].password != this.loginForm.get('password')?.value) {
        await message(this.i18n.t('auth.invalidCredentials'), { kind: "error" });
        return;
      }
      this.userService.setCurrentUser(user[0]._id);
      this.router.navigate(["menu"]);
    } else {
      await message(this.i18n.t('auth.invalidCredentials'), { kind: "error" });
    }
  }
}
