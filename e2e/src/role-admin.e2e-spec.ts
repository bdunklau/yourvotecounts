import { PublicPage } from './public.po';
import { AdminPage } from './role-admin.po';
import { browser, logging } from 'protractor';
import { TokenPage } from './token.po';

describe('Admin page', () => {
  let page: PublicPage;
  let adminPage: AdminPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new PublicPage();
    adminPage = new AdminPage();
    tokenPage = new TokenPage();
  });

  it('when user logs in, should be able to get to Register page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    page.clickHome();
    expect(page.getTitleText()).toEqual('home');
    page.clickRegister()
    expect(page.getTitleText()).toEqual('Complete Your Account');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
