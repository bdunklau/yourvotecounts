import { TokenPage } from './token.po';
import { browser, logging } from 'protractor';

describe('Token generator', () => {
  let page: TokenPage;

  beforeEach(() => {
    page = new TokenPage();
  });

  it('should get a token', async () => {
    var data = {phoneNumber: '5555555555', auth_key: process.env.YOURVOTECOUNTS_AUTH_KEY}
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
    var data = {phoneNumber: '5555555555'}
    page.navigateTo(data);
    expect(page.getTitleText()).toEqual('error');
    var error = await page.getError()
    expect(error).toBeTruthy();
  });

  it('should not get a token (auth_key incorrect)', async () => {
    var data = {phoneNumber: '5555555555', auth_key: 'asdfasdfasd'}
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
