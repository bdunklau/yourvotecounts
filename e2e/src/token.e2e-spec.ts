import { TestSupport } from './test-support.po';
import { browser, logging } from 'protractor';
import { Api } from './api.po';

describe('Token Utility ', () => {
  let page: TestSupport;

  beforeEach(() => {
    page = new TestSupport(new Api());
  });

  it('should have env var YOURVOTECOUNTS_AUTH_KEY', () => {
    expect(process.env.YOURVOTECOUNTS_AUTH_KEY).toBeTruthy();
  })

  it('should have env var YOURVOTECOUNTS_ADMIN_PHONE_NUMBER', () => {
    expect(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER).toBeTruthy();
  })

  it('should have env var YOURVOTECOUNTS_NORMAL_PHONE_NUMBER', () => {
    expect(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER).toBeTruthy();
  })

  it('should have env var YOURVOTECOUNTS_NORMAL_PHONE_NUMBER2', () => {
    expect(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER2).toBeTruthy();
  })

  it('should have env var YOURVOTECOUNTS_TWILIO_AUTH_KEY', () => {
    expect(process.env.YOURVOTECOUNTS_TWILIO_AUTH_KEY).toBeTruthy();
  })

  it('should get a token', async () => {
    var data = {phoneNumber: process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER, auth_key: process.env.YOURVOTECOUNTS_AUTH_KEY}
    page.navigateTo(data);
    expect(page.getTitleText()).toEqual('token');
    var token = await page.getToken()
    expect(token).toBeTruthy();
    expect(token.length > 50).toBeTruthy();
  });

  it('should not get a token (unknown ph number)', async () => {
    var data = {phoneNumber: '0000000000', auth_key: process.env.YOURVOTECOUNTS_AUTH_KEY}
    page.navigateTo(data);
    expect(page.getTitleText()).toEqual('error');
    var error = await page.getError()
    expect(error).toBeTruthy();
  });

  it('should not get a token (no auth_key supplied)', async () => {
    var data = {phoneNumber: process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER}
    page.navigateTo(data);
    expect(page.getTitleText()).toEqual('error');
    var error = await page.getError()
    expect(error).toBeTruthy();
  });

  it('should not get a token (auth_key incorrect)', async () => {
    var data = {phoneNumber: process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER, auth_key: 'asdfasdfasd'}
    page.navigateTo(data);
    expect(page.getTitleText()).toEqual('error');
    var error = await page.getError()
    expect(error).toBeTruthy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
