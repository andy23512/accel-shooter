import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TddWidgetComponent } from './tdd-widget.component';

describe('TddWidgetComponent', () => {
  let component: TddWidgetComponent;
  let fixture: ComponentFixture<TddWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TddWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TddWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
