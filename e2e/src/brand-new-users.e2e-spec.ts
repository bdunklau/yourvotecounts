import { PublicPage } from './public.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

describe('Brand new users', () => {
  let page: PublicPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new PublicPage();
    tokenPage = new TokenPage();
  });


  it('should be required to enter name', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_BRAND_NEW_USER)
    browser.sleep(1000);
    page.goto('/home');
    browser.sleep(500);
    page.clickMyAccount();
    browser.sleep(500);
    expect(page.getTitleText()).toEqual('Complete Your Account');
    page.logout();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
