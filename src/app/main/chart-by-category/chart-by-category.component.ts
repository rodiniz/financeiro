import { Component, inject, OnInit } from "@angular/core";
import { ChartService } from "../../../services/chart.service";
import { ReactiveFormsModule } from "@angular/forms";
import { NgApexchartsModule } from "ng-apexcharts";
import { ChartOptions } from "../../../models/ChartOptions";

@Component({
  selector: "app-chart-by-category",
  standalone: true,
  imports: [ReactiveFormsModule, NgApexchartsModule],
  templateUrl: "./chart-by-category.component.html",
  styleUrl: "./chart-by-category.component.css",
})
export class ChartByCategoryComponent implements OnInit {
  chartService = inject(ChartService);
  public chartOptions!: ChartOptions;
  constructor() {
    this.chartService.getByYear().then((resp) => {
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
  async ngOnInit(): Promise<void> {}
}
