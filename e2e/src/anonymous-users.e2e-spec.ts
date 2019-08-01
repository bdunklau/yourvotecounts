import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { Api } from './api.po';
import { TestSupport } from './test-support.po';

fdescribe('Anonymous users', () => {
  let page: MainPage;
  let testSupport: TestSupport;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
  });

  it('should see Login link', () => {
    page.goto('');
    var login_link = page.getLoginLink();
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  fit('should be redirected from /junkurl to /login', () => {
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


  // We don't want the UI to display a "Token" link.  That's only for e2e testing.
  it('should not display a "Token" link', async () => {
    page.goto('');
    var home_link = page.getHomeLink(); // sanity check
    expect(home_link.isDisplayed()).toBeTruthy();

    var token_link = element(by.xpath("//*[. = 'Token']"));
    expect(token_link.isPresent()).toBeFalsy();
  });

  // We DO want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.goto('');
    var home_link = element(by.id('home_link')); // sanity check
    expect(home_link.isDisplayed()).toBeTruthy();

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
