import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { MyAccountPage } from './my-account.po';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';

describe('Logged in users', () => {
  let page: MainPage;
  let testSupport: TestSupport;
  let myAccountPage: MyAccountPage;
  let apiUser: ApiUser;

  beforeEach(() => {
    apiUser = new ApiUser();
    testSupport = new TestSupport(new Api({user:apiUser}));
    page = new MainPage(testSupport);
    myAccountPage = new MyAccountPage(testSupport);
  });

   it('should be able to logout', async () => {
    let person = page.loginAsSomeone();
    browser.sleep(200);
    page.clickLogout();
    browser.sleep(500);
    // console.log('should be able to logout:  666666666');
    // browser.sleep(500);
    // console.log('should be able to logout:  777777777777');
    var login_link = page.getLoginLink();
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  // We DO want to make sure we can always point the browser to /token however
  it('should be able to point browser to /token', async () => {
    page.gotoTestSupport();
    expect(page.getUrl()).toEqual(browser.baseUrl+'token');
  });


  // leave this as xit()
  xit('should be able to see their name (put back in at some point)', async () => {
  })


  it('should be able to edit name', async () => {
    let person = await page.loginAsSomeone();
    browser.sleep(500);
    page.clickMyAccount();
    myAccountPage.clickEdit();
    myAccountPage.enterName('Bob');
    myAccountPage.clickSubmit();
    expect(myAccountPage.getNameLabel().isDisplayed()).toBeTruthy("expected name label to be displayed but it wasn't ");
    var name = await myAccountPage.getNameLabel().getText();
    expect(name == 'Bob').toBeTruthy("expected name to be Bob but it was actually: "+name);
    myAccountPage.clickEdit();
    myAccountPage.enterName(person.displayName);
    myAccountPage.clickSubmit();
    page.clickLogout();
  });

  // do this
  xit('should be able to upload pic', () => {
    expect(false).toBeTruthy('need to complete this test - need to upload profile pic');
  })

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
