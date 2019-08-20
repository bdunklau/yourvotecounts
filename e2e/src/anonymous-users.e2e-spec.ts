import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';
import { TestSupport } from './test-support.po';

describe('Anonymous users', () => {
  let apiUser: ApiUser;
  let page: MainPage;
  let testSupport: TestSupport;

  beforeEach(() => {
    apiUser = new ApiUser();
    testSupport = new TestSupport(new Api({user:apiUser}));
    page = new MainPage(testSupport);
  });

  // passed 8/7
  it('should see Login link', () => {
    page.goto('');
    var login_link = page.getLoginLink();
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  it('should be redirected from /junkurl to /login', () => {
    page.goto('/junkurl');
    browser.waitForAngularEnabled(false); // without this, you get:  Failed: script timeout: result was not received in 11 seconds
    browser.sleep(300);
    expect(page.getUrl()).toEqual(browser.baseUrl+'/junkurl');
    page.containsLoginBox();
  });

  it('should be redirected from /myaccount to /login', () => {
    page.goto('/myaccount');
    browser.waitForAngularEnabled(false); // without this, you get:  Failed: script timeout: result was not received in 11 seconds
    browser.sleep(300);
    expect(page.getUrl()).toEqual(browser.baseUrl+'/login');
  });

  // passed 8/7
  // We want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.gotoTestSupport();
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
