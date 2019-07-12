import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';

fdescribe('Normal user', () => {
  let page: MainPage;
  let testSupport: TestSupport;

  beforeEach(() => {
    page = new MainPage();
    testSupport = new TestSupport(new Api());
  });

  it( 'should not see a Log link', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    expect(element(by.id('log_link')).isDisplayed()).toBeFalsy();
    page.clickLogout()
  });

  it('should not be able to navigate to /log', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    browser.sleep(500);
    page.goto('/log');
    expect(page.getHomeElement().isPresent()).toBeTruthy();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/home');
    page.clickLogout()
  });

  it('should not see a Users link', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    page.clickHome();
    expect(element(by.id('users_link')).isDisplayed()).toBeFalsy();
    page.clickLogout()
  });

  it('should not be able to navigate to /users', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
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
