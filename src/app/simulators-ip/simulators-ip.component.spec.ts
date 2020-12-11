import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorsIpComponent } from './simulators-ip.component';

describe('SimulatorsIpComponent', () => {
  let component: SimulatorsIpComponent;
  let fixture: ComponentFixture<SimulatorsIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulatorsIpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulatorsIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
