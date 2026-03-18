import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { ChartService } from '../../../services/chart.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { I18nService } from '../../i18n/i18n.service';

@Component({
    selector: 'app-dashboard',
    imports: [ReactiveFormsModule, NgApexchartsModule, CurrencyPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  i18n = inject(I18nService);
  totalExpenses = 0;
  totalIncome = 0;
  monthYears: Array<any> = [];
  chartService = inject(ChartService);
  monthYear = new FormControl("");
  evolutionIncomes:Array<number>=[];
  evolutionExpenses:Array<number>=[];
  evolutionYearMonths:Array<string>=[];
  public chartOptions!: any;
  public evolutionChartOptions!: any;
  async ngOnInit(): Promise<void> {  
    
    await  this.loadData();
    await this.loadEvolutionChart();
  }
  async loadEvolutionChart(): Promise<void> {
      const evolutionExpenses= await this.dashboardService.getEvolutionExpense();
      const evolutionIncomes= await this.dashboardService.getEvolutionIncome();

      for(let i=0; i < evolutionExpenses.length ; i++){
          let evol= evolutionExpenses[i];
          this.evolutionExpenses.push(evol.amount);
          this.evolutionYearMonths.push(evol.monthYear);
      }
      console.log(this.evolutionYearMonths);
      for(let i=0; i < evolutionIncomes.length ; i++){
          let evol= evolutionIncomes[i];
          if(evol.amount !==null){
              this.evolutionIncomes.push(evol.amount);
          }
      }
      this.createEvolutionChart();

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
  tooltip: {
      followCursor: false,
      theme: "dark",
      x: {
          show: false
      },
      marker: {
          show: false
      }},
    series: [
        {
            name: 'Income',
            type: 'column',
            data: this.evolutionIncomes
        },
        {
            name: 'Expense',
            type: 'column',
            data: this.evolutionExpenses
        }
    ],
    xaxis: {
        categories: this.evolutionYearMonths,
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
