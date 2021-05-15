import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsOptInFormComponent } from './sms-opt-in-form.component';

// TODO FIXME test
xdescribe('SmsOptInFormComponent', () => {
  let component: SmsOptInFormComponent;
  let fixture: ComponentFixture<SmsOptInFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmsOptInFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsOptInFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
