import { Component, inject, OnInit } from "@angular/core";
import { ChartService } from "../../../services/chart.service";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { NgApexchartsModule } from "ng-apexcharts";
import { I18nService } from "../../i18n/i18n.service";
import { MonetaryMaskPipe } from "../../shared/pipes/monetary-mask.pipe";

@Component({
    selector: "app-chart-by-category",
    imports: [ReactiveFormsModule, NgApexchartsModule, MonetaryMaskPipe],
    templateUrl: "./chart-by-category.component.html",
    styleUrl: "./chart-by-category.component.css"
})
export class ChartByCategoryComponent implements OnInit {
  chartService = inject(ChartService);
  i18n = inject(I18nService);
  public chartOptions!: any;
  monthYear = new FormControl("");
  monthYears: Array<any> = [];
  totalExpenses: number = 0;
  totalIncome: number = 0;
  constructor() {}
  async ngOnInit(): Promise<void> {
    this.monthYears = await this.chartService.getChartMonthYears();
  }
  async getChart() {
    this.chartService
      .getByMonthYear(this.monthYear.value ?? "")
      .then((resp) => {
        this.chartOptions = {
          series: resp.series.data,
          chart: {
            height: 350,
            type: "pie",
          },
          title: {
            text: this.i18n.t('chart.expensesByCategoryChartTitle'),
          },
          labels: resp.xaxis.categories,
        };
      });

    this.totalExpenses = await this.chartService.getTotalByMonthYear(
      this.monthYear.value ?? ""
    );
    this.totalIncome = await this.chartService.getTotalIncomeByMonthYear(
      this.monthYear.value ?? ""
    );
  }
}
