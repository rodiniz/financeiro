import { Component, inject, OnInit } from "@angular/core";
import { ChartService } from "../../../services/chart.service";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { NgApexchartsModule } from "ng-apexcharts";
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "app-chart-by-category",
  standalone: true,
  imports: [ReactiveFormsModule, NgApexchartsModule, CurrencyPipe],
  templateUrl: "./chart-by-category.component.html",
  styleUrl: "./chart-by-category.component.css",
})
export class ChartByCategoryComponent implements OnInit {
  chartService = inject(ChartService);
  public chartOptions!: any;
  monthYear = new FormControl("");
  monthYears: Array<any> = [];
  totalExpenses: number = 0;
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
            text: "Gráfico de despesas por categoria",
          },
          labels: resp.xaxis.categories,
        };
      });

    this.totalExpenses = await this.chartService.getTotalByMonthYear(
      this.monthYear.value ?? ""
    );
  }
}
