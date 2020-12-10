import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { MyAccountPage } from './my-account.po';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';

fdescribe('Logged in users', () => {
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

  
  // passed on 12/9/20
  fit('should be able to logout', async () => {
    let slp = 1
    let person = await page.loginAsSomeone();

    await page.clickLogout(slp);
    
    var login_link = await page.getLoginLink(slp);
    console.log("do you see the login link?...")
    await browser.sleep(5000);
    expect(login_link.isDisplayed()).toBeTruthy();
  });

  // We DO want to make sure we can always point the browser to /token however
  // passed on 12/9/20
  fit('should be able to point browser to /token', async () => {
    await page.gotoTestSupport();
    expect(page.getUrl()).toEqual(browser.baseUrl+'token');
  });


  // leave this as xit()
  xit('should be able to see their name (put back in at some point)', async () => {
  })

  
  // passed on 12/9/20
  fit('should be able to edit name', async () => {
    let slp = 1
    let person = await page.loginAsSomeone();
    await page.clickMyAccount(slp);     
    await myAccountPage.clickEdit(slp);
    await myAccountPage.enterName('Bob');
    await myAccountPage.clickSubmit();
    expect(myAccountPage.getNameLabel().isDisplayed()).toBeTruthy("expected name label to be displayed but it wasn't ");
    var name = await myAccountPage.getNameLabel().getText();
    expect(name == 'Bob').toBeTruthy("expected name to be Bob but it was actually: "+name);

    await myAccountPage.clickEdit(slp);
    await myAccountPage.enterName(person.displayName);
    await myAccountPage.clickSubmit();
    await page.clickLogout(slp);
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
