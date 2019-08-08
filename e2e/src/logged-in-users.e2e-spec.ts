import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { MyAccountPage } from './my-account.po';
import { Api } from './api.po';

fdescribe('Logged in users', () => {
  let page: MainPage;
  let testSupport: TestSupport;
  let myAccountPage: MyAccountPage;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
    myAccountPage = new MyAccountPage();
  });

  it('should be able to logout', () => {
    // testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    testSupport.login(testSupport.normalUser.phoneNumber);
    page.clickMyAccount();
    browser.sleep(200);
    expect(page.getMyAccountElement().isDisplayed()).toBeTruthy();
    page.clickLogout();
    browser.sleep(500);
    var login_link = page.getLoginLink()
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  // We DO want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.gotoTestSupport();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/token');
  });


  xit('should be able to see their name (put back in at some point)', async () => {
  })


  it('should be able to edit name', async () => {
    testSupport.login(testSupport.normalUser.phoneNumber);
    page.clickMyAccount();
    myAccountPage.clickEdit();
    myAccountPage.enterName('Bob');
    myAccountPage.clickSubmit();
    expect(myAccountPage.getNameLabel().isDisplayed()).toBeTruthy();
    var name = await myAccountPage.getNameLabel().getText();
    expect(name == 'Bob').toBeTruthy();
    myAccountPage.clickEdit();
    myAccountPage.enterName('Joe');
    myAccountPage.clickSubmit();
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
