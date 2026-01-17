import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardIconComponent } from "@shared/components/icon/icon.component";

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, ZardIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar { }
