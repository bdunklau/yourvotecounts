import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsOptInComponent } from './sms-opt-in.component';

// TODO FIXME test
xdescribe('SmsOptInComponent', () => {
  let component: SmsOptInComponent;
  let fixture: ComponentFixture<SmsOptInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmsOptInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsOptInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
