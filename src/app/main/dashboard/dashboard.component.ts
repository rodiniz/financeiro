import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { ChartService } from '../../../services/chart.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, NgApexchartsModule,CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  totalExpenses = 0;
  totalIncome = 0;
  monthYears: Array<any> = [];
  chartService = inject(ChartService);
  monthYear = new FormControl("");
  public chartOptions!: any;
  public evolutionChartOptions!: any;
  async ngOnInit(): Promise<void> {  
    
    this.loadData();
  }

   async loadData(){
    let sqlReturn= await this.dashboardService.getTotalExpenses(this.monthYear.value ?? null);
    this.totalExpenses = sqlReturn;
    this.monthYears = await this.chartService.getChartMonthYears();
    this.totalIncome= await this.dashboardService.getTotalIncome(this.monthYear.value ?? null);
    let resp=await this.dashboardService.getTopExpenses(this.monthYear.value ?? null);
   
    this.chartOptions = {
      series: resp.series.data,
      chart: {
        background: '#fff',
        height: 350,
        type: "pie",
        toolbar: {
          show: true
        }
      },
      title: {
        text: "Gráfico de despesas por categoria",
      },
      labels: resp.xaxis.categories,
    };

    this.createEvolutionChart();

   }

   createEvolutionChart(){
    
 
  this.evolutionChartOptions = {
    chart: {
        background: '#fff',
        type: 'bar',
        height: 350,
        stacked: false,
        toolbar: {
            show: true
        }
    },
    series: [
        {
            name: 'Income',
            type: 'column',
            data: [4500, 5200, 6100, 6700, 7200]
        },
        {
            name: 'Expense',
            type: 'column',
            data: [2300, 2800, 3400, 3700, 4100]
        }
    ],
    xaxis: {
        categories: ['2020-01', '2020-02', '2020-03', '2020-04', '2020-05'],
        title: { text: 'Year/Month' }
    },
    yaxis: {
        title: { text: 'Amount ($)' },
        labels: {
            formatter: function(value:number) { return '$' + value; }
         }
    },
    title: {
        text: 'Income and Expense Overview',
        align: 'left'
    }
  }
  };
}
