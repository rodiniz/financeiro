import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ask } from '@tauri-apps/plugin-dialog';
import { LucideAngularModule } from "lucide-angular";
import { I18nService } from 'src/app/i18n/i18n.service';
import { Income } from 'src/models/income';
import { IncomeService } from 'src/services/income.service';

@Component({
  selector: 'app-income-list',
  imports: [LucideAngularModule, DatePipe],
  templateUrl: './income-list.html',
  styleUrl: './income-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeList {

router = inject(Router);
i18n = inject(I18nService);
incomes = signal<Array<Income>>([]);
IncomeService = inject(IncomeService);
 async ngOnInit(): Promise<void> {
  debugger;
    const incomes = await this.IncomeService.getAll(
      "date DESC"
    );
    this.incomes.set(incomes);
  }
  redirectToEdit(id: string) {
     this.router.navigate(["/menu/editIncome", id]);
  }
  async deleteIncome(id: string) {
       const yes = await ask(this.i18n.t('income.list.deleteConfirm'), this.i18n.t('app.title'));
    if (yes) {
      await this.IncomeService.delete(id);
      const incomes = await this.IncomeService.getAll(
        "date DESC"
      );
      this.incomes.set(incomes);
   
    }
  }
  redirectToCreate() {
      this.router.navigate(["/menu/createIncome"]);
  }
    formatData(data: Date) {
    //2024-08-08
    return (
      data.toString().substring(8, 10) +
      "/" +
      data.toString().substring(5, 7) +
      "/" +
      data.toString().substring(0, 4)
    );
  }
}
