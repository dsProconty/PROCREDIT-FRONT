import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorsVComponent } from './simulators-v.component';

describe('SimulatorsVComponent', () => {
  let component: SimulatorsVComponent;
  let fixture: ComponentFixture<SimulatorsVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulatorsVComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorsVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
