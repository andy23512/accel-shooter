import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeRequestDescriptionPageComponent } from './merge-request-description-page.component';

describe('MergeRequestDescriptionPageComponent', () => {
  let component: MergeRequestDescriptionPageComponent;
  let fixture: ComponentFixture<MergeRequestDescriptionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MergeRequestDescriptionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeRequestDescriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
