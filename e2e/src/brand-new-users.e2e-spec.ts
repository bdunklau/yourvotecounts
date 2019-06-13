import { PublicPage } from './public.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

fdescribe('Brand new users', () => {
  let page: PublicPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new PublicPage();
    tokenPage = new TokenPage();
  });


  fit('should be required to enter name', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_BRAND_NEW_USER)
    page.gotoBaseUrl();
    browser.sleep(500);
    page.pullDownMyMenu();
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
