import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantCrudComponent } from './plant-crud.component';

describe('PlantCrudComponent', () => {
  let component: PlantCrudComponent;
  let fixture: ComponentFixture<PlantCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlantCrudComponent]
    });
    fixture = TestBed.createComponent(PlantCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
