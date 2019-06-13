import { PublicPage } from './public.po';
import { AdminPage } from './role-admin.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

describe('Admin page', () => {
  // let page: PublicPage;
  let page: AdminPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    // page = new PublicPage();
    page = new AdminPage();
    tokenPage = new TokenPage();
  });

  it('normal user should not be able to get to Log page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    var log_link = element(by.id('log_link'));
    expect(log_link.isDisplayed()).toBeFalsy();
    expect(page.getTitleText()).toEqual('home');
    page.logout()
  });

  it('normal user should not be able to get to Users page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    page.clickHome();
    var users_link = element(by.id('users_link'));
    expect(users_link.isDisplayed()).toBeFalsy();
    expect(page.getTitleText()).toEqual('home');
    page.logout()
  });

  it('when admin logs in, should be able to get to Log page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    browser.sleep(10000);
    page.clickLog();
    expect(page.getTitleText()).toEqual('Log');
    page.logout()
  });

  it('when admin logs in, should be able to get to Users page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickUsers();
    expect(page.getTitleText()).toEqual('Users');
    page.logout()
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
