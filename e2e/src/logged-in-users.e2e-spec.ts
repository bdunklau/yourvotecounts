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

  /*not passed*/ fit('should be able to logout', async () => {
    // testSupport.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    // testSupport.login(testSupport.normalUser.phoneNumber);
    let person = page.loginAsSomeone();
    await page.setLegal(person, true);
    browser.sleep(500);
    page.goto('');
    page.clickMyAccount();
    browser.sleep(200);
    console.log('should be able to logout:  5555555555555');
    expect(page.getMyAccountElement().isDisplayed()).toBeTruthy();
    page.clickLogout();
    // console.log('should be able to logout:  666666666');
    // browser.sleep(500);
    // console.log('should be able to logout:  777777777777');
    // var login_link = page.getLoginLink()
    // console.log('should be able to logout:  88888888888');
    // expect(login_link.isDisplayed()).toBeTruthy();
    // console.log('should be able to logout:  999999999:  login_link.isDisplayed()', login_link.isDisplayed());
  });

  // We DO want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.gotoTestSupport();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/token');
  });


  // leave this as /*not passed*/ xit()
  /*not passed*/ xit('should be able to see their name (put back in at some point)', async () => {
  })


  /*not passed*/ xit('should be able to edit name', async () => {
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
