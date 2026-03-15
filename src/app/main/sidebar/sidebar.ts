import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardIconComponent } from "@shared/components/icon/icon.component";
import { I18nService } from "../../i18n/i18n.service";

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, ZardIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  i18n = inject(I18nService);
}
