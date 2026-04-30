import { Pipe, PipeTransform, inject } from '@angular/core';
import { MonetaryVisibilityService } from '../../../services/monetary-visibility.service';

@Pipe({
  name: 'monetaryMask',
  standalone: true,
  pure: false
})
export class MonetaryMaskPipe implements PipeTransform {
  private monetaryVisibilityService = inject(MonetaryVisibilityService);

  transform(value: number): string {
    if (this.monetaryVisibilityService.isHidden()) {
      return '*****';
    }
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }
}
