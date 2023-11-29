import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccelUpPageComponent } from './accel-up-page.component';

describe('AccelUpPageComponent', () => {
  let component: AccelUpPageComponent;
  let fixture: ComponentFixture<AccelUpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccelUpPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccelUpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
