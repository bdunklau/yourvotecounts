import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';

// passed on 8/10/20
describe('Minimal Account Info Guard', () => {
  let page: MainPage;
  let testSupport: TestSupport;

  beforeEach(() => {
    testSupport = new TestSupport(new Api({user: new ApiUser()}));
    page = new MainPage(testSupport);
  });


  it('should not be able to visit most pages until completing their profile', async () => {
    let slp = 1
      // make list of the links that users cannot visit with an incomplete account
      // teams, my-account,
    page.loginNewUser();
    browser.sleep(500);
    await page.clickMyAccount(slp);
    browser.sleep(500);
    var url = await page.getUrl();
    expect(url === browser.baseUrl+'minimal-account-info').toBeTruthy('expected My Account link to send us to /minimal-account-info page, but instead we got '+url);

    page.clickTeams();
    browser.sleep(500);
    url = await page.getUrl();
    expect(url === browser.baseUrl+'minimal-account-info').toBeTruthy('expected Teams link to send us to /minimal-account-info page, but instead we got '+url);


    // but there are some pages we allow them to get to...
    // home, / , logout, privacy, tos
    page.pullDownMyMenu();
    page.clickHome();
    browser.sleep(500);
    url = await page.getUrl();
    expect(url === browser.baseUrl+'home').toBeTruthy('expected Home link to send us to /home page, but instead we got '+url);
    await page.clickLogout(slp);
  });


  // make sure the guard doesn't accidentally redirect everyone
  // passed 8/13/20
  it('should allow those with completed profiles to access pages', async () => {
    page.loginAsSomeone();
    browser.sleep(500);
    page.clickMyAccount();
    browser.sleep(500);
    var url = await page.getUrl();
    expect(url === browser.baseUrl+'myaccount').toBeTruthy('expected My Account link to send us to /myaccount page, but instead we got '+url);

    //page.pullDownMyMenu();
    page.clickTeams();
    browser.sleep(500);
    url = await page.getUrl();
    expect(url === browser.baseUrl+'teams').toBeTruthy('expected Teams link to send us to /teams page, but instead we got '+url);

    page.pullDownMyMenu();
    page.clickHome();
    browser.sleep(500);
    url = await page.getUrl();
    expect(url === browser.baseUrl+'home').toBeTruthy('expected Home link to send us to /home page, but instead we got '+url);
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
