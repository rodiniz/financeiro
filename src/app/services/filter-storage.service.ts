import { Injectable, signal } from '@angular/core';

export interface ExpenseFilters {
  monthYear: string | null;
  category: string | null;
  onlyWithoutCategory: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilterStorageService {
  private filters = signal<ExpenseFilters>({
    monthYear: '',
    category: '',
    onlyWithoutCategory: false
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
      onlyWithoutCategory: false
    });
  }
}
