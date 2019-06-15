import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

describe('Logged in users', () => {
  let page: MainPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new MainPage();
    tokenPage = new TokenPage();
  });

  it('should be able to logout', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    page.clickMyAccount();
    expect(page.getMyAccountElement().isDisplayed()).toBeTruthy();
    page.clickLogout();
    var login_link = page.getLoginLink()
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  // We don't want the UI to display a "Token" link.  That's only for e2e testing.
  it('should not display a "Token" link', async () => {
    page.goto('');
    var home_link = page.getHomeLink(); // sanity check
    expect(home_link.isDisplayed()).toBeTruthy();

    var token_link = page.getTokenLink();
    expect(token_link.isPresent()).toBeFalsy();
  });

  // We DO want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.goto('');
    var home_link = page.getHomeLink(); // sanity check
    expect(home_link.isDisplayed()).toBeTruthy();

    page.gotoTokenPage();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/token');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
