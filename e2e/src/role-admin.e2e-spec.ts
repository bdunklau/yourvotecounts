import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';
import { AdminPage } from './admin.po';

describe('Admins', () => {
  // let page: PublicPage;
  let page: MainPage;
  let tokenPage: TokenPage;
  let adminPage: AdminPage;

  beforeEach(() => {
    // page = new PublicPage();
    page = new MainPage();
    tokenPage = new TokenPage();
    adminPage = new AdminPage();
  });

  it('should be able to get to Log page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickLog();
    expect(page.getTitleText()).toEqual('Log');
    page.clickLogout()
  });

  it('should be able to filter to only debug', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickLog();
    adminPage.setLevels(['debug']);
    
    page.clickLogout()
  });

  it('should be able to get to Users page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickUsers();
    expect(page.getTitleText()).toEqual('Users');
    page.clickLogout()
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
