import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwilioSettingsComponent } from './twilio-settings.component';


// TODO FIXME test
xdescribe('TwilioSettingsComponent', () => {
  let component: TwilioSettingsComponent;
  let fixture: ComponentFixture<TwilioSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwilioSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwilioSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('TwilioSettingsComponent: begin')
    expect(component).toBeTruthy();
    console.log('TwilioSettingsComponent: end')
  });
});
