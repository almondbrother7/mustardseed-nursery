import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GardeningComponent } from './gardening.component';

describe('gardeningComponent', () => {
  let component: GardeningComponent;
  let fixture: ComponentFixture<GardeningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GardeningComponent]
    });
    fixture = TestBed.createComponent(GardeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
