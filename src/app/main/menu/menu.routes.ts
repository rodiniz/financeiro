import { Routes } from "@angular/router";
import { MenuComponent } from "./menu.component";

export const FinanceiroRoutes: Routes = [
  {
    path: "",
    component: MenuComponent,
    children: [
      {
        path: "", //login
        loadComponent: () =>
          import("../categorylist/categorylist.component").then(
            (m) => m.CategorylistComponent
          ),
      },
      {
        path: "listCategories", //login
        loadComponent: () =>
          import("../categorylist/categorylist.component").then(
            (m) => m.CategorylistComponent
          ),
      },
      {
        path: "createCategory",
        loadComponent: () =>
          import("../category-edit/category-edit.component").then(
            (m) => m.CategoryEditComponent
          ),
      },
      {
        path: "editCategory/:id",
        loadComponent: () =>
          import("../category-edit/category-edit.component").then(
            (m) => m.CategoryEditComponent
          ),
      },
      {
        path: "listExpenses", //login
        loadComponent: () =>
          import("../expenses-list/expenses-list.component").then(
            (m) => m.ExpensesListComponent
          ),
      },
      {
        path: "createExpense",
        loadComponent: () =>
          import("../expenses-edit/expenses-edit.component").then(
            (m) => m.ExpensesEditComponent
          ),
      },
      {
        path: "editExpense/:id",
        loadComponent: () =>
          import("../expenses-edit/expenses-edit.component").then(
            (m) => m.ExpensesEditComponent
          ),
      },
      {
        path: "chartByYear",
        loadComponent: () =>
          import("../chart-by-year/chart-by-year.component").then(
            (m) => m.ChartByYearComponent
          ),
      },
      {
        path: "chartByCategory",
        loadComponent: () =>
          import("../chart-by-category/chart-by-category.component").then(
            (m) => m.ChartByCategoryComponent
          ),
      },
      {
        path: "dashboard",
        loadComponent: () =>
            import("../dashboard/dashboard.component").then(
                (m) => m.DashboardComponent
            ),
      },
      {
        path: "listIncomes", //login
        loadComponent: () =>
          import("../income-list/income-list").then(
            (m) => m.IncomeList
          ),
      },
      
    
      
    ],
  },
];
