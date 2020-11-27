import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSmsComponent } from './review-sms.component';


// TODO FIXME test
xdescribe('ReviewSmsComponent', () => {
  let component: ReviewSmsComponent;
  let fixture: ComponentFixture<ReviewSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewSmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
