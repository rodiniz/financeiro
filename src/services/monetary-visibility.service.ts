import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonetaryVisibilityService {
  private hideMonetaryValues = signal<boolean>(
    localStorage.getItem('hideMonetaryValues') === 'true'
  );

  readonly isMonetaryValueHidden = this.hideMonetaryValues.asReadonly();

  toggleVisibility(hide: boolean) {
    this.hideMonetaryValues.set(hide);
    if (hide) {
      localStorage.setItem('hideMonetaryValues', 'true');
    } else {
      localStorage.removeItem('hideMonetaryValues');
    }
  }

  isHidden(): boolean {
    return this.hideMonetaryValues();
  }
}
