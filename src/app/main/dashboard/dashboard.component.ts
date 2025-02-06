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
  async ngOnInit(): Promise<void> {  
    this.loadData();
  }

   async loadData(){
    let sqlReturn= await this.dashboardService.getTotalExpenses(this.monthYear.value ?? null);
    this.totalExpenses = sqlReturn;
    this.monthYears = await this.chartService.getChartMonthYears();
    this.totalIncome= await this.dashboardService.getTotalIncome(this.monthYear.value ?? null);
   }
}
