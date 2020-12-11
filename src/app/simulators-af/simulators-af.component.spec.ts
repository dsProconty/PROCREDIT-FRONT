import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorsAfComponent } from './simulators-af.component';

describe('SimulatorsAfComponent', () => {
  let component: SimulatorsAfComponent;
  let fixture: ComponentFixture<SimulatorsAfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulatorsAfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorsAfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
