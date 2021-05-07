import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';

describe('Normal user', () => {
  let page: MainPage;
  let testSupport: TestSupport;
  let apiUser: ApiUser;

  beforeEach(() => {
    apiUser = new ApiUser();
    testSupport = new TestSupport(new Api({user:apiUser}));
    page = new MainPage(testSupport);
  });

  // passed 8/13/20
  it( 'should not see a Log link', async () => {
    let slp = 1
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    await page.clickMyAccount(slp);
    browser.sleep(200);
    expect(element(by.id('log_link')).isDisplayed()).toBeFalsy();
    await page.clickLogout(slp)
  });

  // passed 8/13/20
  it('should not be able to navigate to /log', async () => {
    let slp = 1
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    await page.clickMyAccount(slp);
    browser.sleep(200);
    page.clickHome();
    browser.sleep(500);
    page.goto('/log');
    expect(page.getHomeElement().isPresent()).toBeTruthy();
    expect(page.getUrl()).toEqual(browser.baseUrl+'home');
    await page.clickLogout(slp)
  });

  it('should not see a Users link', async () => {
    let slp = 1
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    page.clickMyAccount(slp);
    browser.sleep(200);
    page.clickHome();
    expect(element(by.id('users_link')).isDisplayed()).toBeFalsy();
    await page.clickLogout(slp)
  });

  it('should not be able to navigate to /users', async () => {
    let slp = 1
    testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    await page.clickMyAccount(slp);
    browser.sleep(200);
    page.clickHome();
    page.goto('/users');
    expect(page.getHomeElement().isDisplayed()).toBeTruthy();
    expect(page.getUrl()).toEqual(browser.baseUrl+'home');
    await page.clickLogout(slp)
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
