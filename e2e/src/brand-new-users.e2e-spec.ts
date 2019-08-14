import { MainPage } from './main.po';
import { MyAccountPage } from './my-account.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';

fdescribe('Brand new users', () => {
  let page: MainPage;
  let myAccountPage: MyAccountPage;
  let testSupport: TestSupport;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
    myAccountPage = new MyAccountPage();
  });


  // passed 8/7
  it('should be required to enter name', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_BRAND_NEW_USER)
    // page.goto('/home');
    page.clickMyAccount();
    browser.sleep(200);
    expect(myAccountPage.getNameField().isDisplayed()).toBeTruthy();
    browser.sleep(200);
    page.clickLogout();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
