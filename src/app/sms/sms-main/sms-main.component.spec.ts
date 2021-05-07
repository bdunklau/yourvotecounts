import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsMainComponent } from './sms-main.component';


// TODO FIXME test
xdescribe('SmsMainComponent', () => {
  let component: SmsMainComponent;
  let fixture: ComponentFixture<SmsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmsMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
