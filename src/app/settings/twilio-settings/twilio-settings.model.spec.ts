import { TwilioSettings } from './twilio-settings.model';


// TODO FIXME test
xdescribe('TwilioSettings', () => {
  it('should create an instance', () => {
    console.log('TwilioSettings: begin')
    expect(new TwilioSettings()).toBeTruthy();
    console.log('TwilioSettings: end')
  });
});
