import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartByYearComponent } from './chart-by-year.component';

describe('ChartByYearComponent', () => {
  let component: ChartByYearComponent;
  let fixture: ComponentFixture<ChartByYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartByYearComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChartByYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
