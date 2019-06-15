import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

describe('Normal user', () => {
  let page: MainPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new MainPage();
    tokenPage = new TokenPage();
  });

  it( 'should not see a Log link', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    expect(element(by.id('log_link')).isDisplayed()).toBeFalsy();
    page.clickLogout()
  });

  it('should not be able to navigate to /log', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    browser.sleep(2000);
    page.goto('/log');
    expect(page.getHomeElement().isPresent()).toBeTruthy();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/home');
    page.clickLogout()
  });

  it('should not see a Users link', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    page.clickHome();
    expect(element(by.id('users_link')).isDisplayed()).toBeFalsy();
    page.clickLogout()
  });

  it('should not be able to navigate to /users', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    page.goto('/users');
    expect(page.getHomeElement().isDisplayed()).toBeTruthy();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/home');
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
