import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorsAdpfComponent } from './simulators-adpf.component';

describe('SimulatorsAdpfComponent', () => {
  let component: SimulatorsAdpfComponent;
  let fixture: ComponentFixture<SimulatorsAdpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulatorsAdpfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorsAdpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
