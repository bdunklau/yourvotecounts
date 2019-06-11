import { TokenPage } from './token.po';
import { browser, logging } from 'protractor';

describe('Token generator', () => {
  let page: TokenPage;

  beforeEach(() => {
    page = new TokenPage();
  });

  it('should get a token', async () => {
    page.navigateTo('5555555555');
    expect(page.getTitleText()).toEqual('token');
    var token = await page.getToken()
    expect(token).toBeTruthy();
    expect(token.length > 50).toBeTruthy();
  });

  it('should not get a token', async () => {
    page.navigateTo('0000000000');
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
