import { Component, inject, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ChartOptions } from "../../../models/ChartOptions";
import { ChartService } from "../../../services/chart.service";
import { NgApexchartsModule } from "ng-apexcharts";

@Component({
    selector: "app-chart-by-year",
    imports: [ReactiveFormsModule, NgApexchartsModule],
    templateUrl: "./chart-by-year.component.html",
    styleUrl: "./chart-by-year.component.css"
})
export class ChartByYearComponent implements OnInit {
  chartService = inject(ChartService);
  public chartOptions!: any;
  year = new FormControl<number>(0);
  years: Array<any> = [];
  constructor() {
    this.year.setValue(new Date().getFullYear());
    this.getChart();
  }
  async ngOnInit(): Promise<void> {
    this.years = await this.chartService.getChartYears();
  }
  async getChart() {
    this.chartService.getByYear(this.year.value ?? 0).then((resp) => {
      this.chartOptions = {
        series: [
          {
            name: "",
            data: resp.series.data,
          },
        ],
        chart: {
          height: 350,
          type: "bar",
        },
        title: {
          text: "Gráfico de despesas por ano",
        },
        xaxis: {
          //labels do gráfico
          categories: resp.xaxis.categories,
        },
      };
    });
  }
}
