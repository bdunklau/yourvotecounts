import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';
import { ApiPrivacyPolicy } from './api-privacy-policy.po';
import { PrivacyPolicyPage } from './privacy-policy.po';

describe('Privacy Policy page', () => {
  let page: MainPage;
  let testSupport: TestSupport;
  let privacyPolicyPage: PrivacyPolicyPage;
  let apiPrivacyPolicy: ApiPrivacyPolicy;

  beforeEach(() => {
    apiPrivacyPolicy = new ApiPrivacyPolicy();
    testSupport = new TestSupport(new Api({privacyPolicy: apiPrivacyPolicy}));
    page = new MainPage(testSupport);
    privacyPolicyPage = new PrivacyPolicyPage(testSupport);
  });


  it('should let you edit the privacy policy', async () => {
    // login as admin
    // navigate to the PP page
    // get the PP
    // edit the PP
    // save the PP
    // navigate away or refresh the page
    // verify new PP
    // set the PP back to what it was
    let slp = 1

    page.loginAdmin();
    page.clickPrivacyPolicy();
    var actualPrivacyPolicy = await apiPrivacyPolicy.getPrivacyPolicy();
    expect(privacyPolicyPage.getPrivacyPolicy()).toEqual(actualPrivacyPolicy['text']);


    // edit the PP
    let origPolicy = actualPrivacyPolicy['text'];
    let newPolicy = 'we will sell all your info';
    await privacyPolicyPage.setPrivacyPolicy(newPolicy);
    browser.sleep(500);
    let pp2 = await apiPrivacyPolicy.getPrivacyPolicy();
    expect(newPolicy).toEqual(pp2['text']);

    // set the PP back to what it was
    await privacyPolicyPage.setPrivacyPolicy(origPolicy);
    browser.sleep(2000); // 1000 not enough
    let pp3 = await apiPrivacyPolicy.getPrivacyPolicy();
    expect(origPolicy).toEqual(pp3['text']);

    await page.clickLogout(slp);
  });



  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
