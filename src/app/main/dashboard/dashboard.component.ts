import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { DecimalPipe } from '@angular/common';
import { ChartService } from '../../../services/chart.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { I18nService } from '../../i18n/i18n.service';
import { MonetaryMaskPipe } from '../../shared/pipes/monetary-mask.pipe';

@Component({
    selector: 'app-dashboard',
    imports: [ReactiveFormsModule, NgApexchartsModule, DecimalPipe, MonetaryMaskPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  i18n = inject(I18nService);
  totalExpenses = 0;
  totalIncome = 0;
  fixedCosts = 0;
  variableCosts = 0;
  savingsRate = 0;
  chartService = inject(ChartService);
  
  // Date range controls
  startDate = new FormControl(this.getFirstDayOfMonth());
  endDate = new FormControl(this.getTodayDate());
  
  evolutionIncomes:Array<number>=[];
  evolutionExpenses:Array<number>=[];
  evolutionYearMonths:Array<string>=[];
  public chartOptions!: any;
  public evolutionChartOptions!: any;

  private getFirstDayOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async ngOnInit(): Promise<void> {  
    await this.loadData();
    await this.loadEvolutionChart();
  }

  async loadEvolutionChart(): Promise<void> {
    const evolutionExpenses = await this.dashboardService.getEvolutionExpense();
    const evolutionIncomes = await this.dashboardService.getEvolutionIncome();

    for(let i=0; i < evolutionExpenses.length ; i++){
      let evol = evolutionExpenses[i];
      this.evolutionExpenses.push(evol.amount);
      this.evolutionYearMonths.push(evol.monthYear);
    }
    for(let i=0; i < evolutionIncomes.length ; i++){
      let evol = evolutionIncomes[i];
      if(evol.amount !== null){
        this.evolutionIncomes.push(evol.amount);
      }
    }
    this.createEvolutionChart();
  }

  async loadData(){
    const startDate = this.startDate.value;
    const endDate = this.endDate.value;

    let sqlReturn = await this.dashboardService.getTotalExpenses(startDate, endDate);
    this.totalExpenses = sqlReturn;
    this.totalIncome = await this.dashboardService.getTotalIncome(startDate, endDate);
    
    const expenseBreakdown = await this.dashboardService.getExpenseBreakdown(startDate, endDate);
    this.fixedCosts = expenseBreakdown.fixedCosts ?? 0;
    this.variableCosts = expenseBreakdown.variableCosts ?? 0;
    
    if (this.totalIncome > 0) {
      this.savingsRate = ((this.totalIncome - this.totalExpenses) / this.totalIncome) * 100;
    } else {
      this.savingsRate = 0;
    }
    
    let resp = await this.dashboardService.getTopExpenses(startDate, endDate);
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
        text: this.i18n.t('dashboard.topByCategoryChartTitle'),
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
            name: this.i18n.t('dashboard.evolutionIncomeSeries'),
            type: 'column',
            data: this.evolutionIncomes
        },
        {
            name: this.i18n.t('dashboard.evolutionExpenseSeries'),
            type: 'column',
            data: this.evolutionExpenses
        }
    ],
    xaxis: {
        categories: this.evolutionYearMonths,
        title: { text: this.i18n.t('dashboard.evolutionXAxisTitle') }
    },
    yaxis: {
        title: { text: this.i18n.t('dashboard.evolutionYAxisTitle') },
        labels: {
            formatter: function(value:number) { return value.toString(); }
         }
    },
    title: {
        text: this.i18n.t('dashboard.evolutionChartTitle'),
        align: 'left'
    }
  }
  };
}
