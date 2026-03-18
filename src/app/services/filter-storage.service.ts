import { Injectable, signal } from '@angular/core';

export interface ExpenseFilters {
  monthYear: string | null;
  category: string | null;
  onlyWithoutCategory: boolean;
  recurrent: string | null;
  search: string | null;
  minAmount: number | null;
  maxAmount: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class FilterStorageService {
  private filters = signal<ExpenseFilters>({
    monthYear: '',
    category: '',
    onlyWithoutCategory: false,
    recurrent: 'all',
    search: '',
    minAmount: null,
    maxAmount: null
  });
  
  readonly currentFilters = this.filters.asReadonly();
  
  setFilters(filters: Partial<ExpenseFilters>) {
    this.filters.update(current => ({ ...current, ...filters }));
  }
  
  getFilters(): ExpenseFilters {
    return this.filters();
  }
  
  resetFilters() {
    this.filters.set({
      monthYear: '',
      category: '',
      onlyWithoutCategory: false,
      recurrent: 'all',
      search: '',
      minAmount: null,
      maxAmount: null
    });
  }
}
