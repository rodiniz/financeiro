import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartByCategoryComponent } from './chart-by-category.component';

describe('ChartByCategoryComponent', () => {
  let component: ChartByCategoryComponent;
  let fixture: ComponentFixture<ChartByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartByCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChartByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
