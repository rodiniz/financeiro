import { ChangeDetectionStrategy, Component, input, output, ViewEncapsulation } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'z-pagination',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-600">
          Showing {{ startRecord() }} to {{ endRecord() }} of {{ total() }} results
        </span>
      </div>
      <div class="flex items-center gap-1">
        <button
          (click)="onPageChange(currentPage() - 1)"
          [disabled]="currentPage() === 1"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 transition-all duration-200"
        >
          <lucide-angular name="ChevronLeftIcon" class="w-4 h-4"></lucide-angular>
        </button>
        
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-2 text-slate-400">...</span>
          } @else {
            <button
              (click)="onPageChange(page)"
              [class.bg-amber-500]="page === currentPage()"
              [class.text-white]="page === currentPage()"
              [class.border-amber-500]="page === currentPage()"
              class="inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-200"
              [class.border-slate-200]="page !== currentPage()"
              [class.bg-white]="page !== currentPage()"
              [class.text-slate-600]="page !== currentPage()"
              [class.hover:bg-slate-50]="page !== currentPage()"
              [class.hover:text-slate-900]="page !== currentPage()"
            >
              {{ page }}
            </button>
          }
        }
        
        <button
          (click)="onPageChange(currentPage() + 1)"
          [disabled]="currentPage() === totalPages()"
          class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 transition-all duration-200"
        >
          <lucide-angular name="ChevronRightIcon" class="w-4 h-4"></lucide-angular>
        </button>
      </div>
    </div>
  `
})
export class ZardPaginationComponent {
  readonly currentPage = input(1);
  readonly total = input(0);
  readonly pageSize = input(10);
  readonly pageChange = output<number>();

  readonly totalPages = () => Math.ceil(this.total() / this.pageSize()) || 1;
  
  readonly startRecord = () => {
    if (this.total() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  };
  
  readonly endRecord = () => Math.min(this.currentPage() * this.pageSize(), this.total());

  readonly visiblePages = () => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    
    return pages;
  };

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
