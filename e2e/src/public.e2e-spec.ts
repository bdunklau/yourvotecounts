import { PublicPage } from './public.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

describe('Public page', () => {
  let page: PublicPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new PublicPage();
    tokenPage = new TokenPage();
  });

  it('when user not logged in, should see Login link', () => {
    page.gotoBaseUrl();
    var login_link = element(by.id('login_link'));
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  it('when user IS logged in, should see Logout link', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    page.gotoBaseUrl();
    browser.sleep(500);
    var logout_link = element(by.id('logout_link'));
    expect(logout_link.isDisplayed()).toBeTruthy();
    page.logout();
  });

  it('when user logs in, should be able to get to Register page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    // browser.get(browser.baseUrl);
    page.clickHome();
    expect(page.getTitleText()).toEqual('home');
    page.clickRegister();
    expect(page.getTitleText()).toEqual('Complete Your Account');
    page.logout();
  });

  it('should be able to logout', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    page.clickRegister();
    expect(page.getTitleText()).toEqual('Complete Your Account');
    page.logout();
    page.clickRegister();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/login');
  });

  // We don't want the UI to display a "Token" link.  That's only for e2e testing.
  it('should not display a "Token" link', async () => {
    page.gotoBaseUrl();
    var home_link = element(by.id('home_link')); // sanity check
    expect(home_link.isDisplayed()).toBeTruthy();

    var myText = "Token";
    var selectedElement = element(by.xpath("//*[. = '" + myText + "']"));

    expect(selectedElement.isPresent()).toBeFalsy();
  });

  // We DO want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.gotoBaseUrl();
    var home_link = element(by.id('home_link')); // sanity check
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
