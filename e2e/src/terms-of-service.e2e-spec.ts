import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';
import { ApiTermsOfService } from './api-terms-of-service.po';
import { TermsOfServicePage } from './terms-of-service.po';

fdescribe('Terms of Service page', () => {
  let page: MainPage;
  let testSupport: TestSupport;
  let termsOfServicePage: TermsOfServicePage;
  let apiTermsOfService: ApiTermsOfService;

  beforeEach(() => {
    apiTermsOfService = new ApiTermsOfService();
    testSupport = new TestSupport(new Api({termsOfService: apiTermsOfService}));
    page = new MainPage(testSupport);
    termsOfServicePage = new TermsOfServicePage(testSupport);
  });


  it('should let you edit the terms of service', async () => {
    // login as admin
    // navigate to the TOS page
    // get the TOS
    // edit the TOS
    // save the TOS
    // navigate away or refresh the page
    // verify new TOS
    // set the TOS back to what it was

    page.loginAdmin();
    page.clickTerms();
    var actualTerms = await apiTermsOfService.getTermsOfService();
    expect(termsOfServicePage.getTermsOfService()).toEqual(actualTerms['text']);


    // edit the TOS
    let origTerms = actualTerms['text'];
    let newTerms = 'our terms are take it or leave it';
    await termsOfServicePage.setTermsOfService(newTerms);
    browser.sleep(500);
    let tos2 = await apiTermsOfService.getTermsOfService();
    expect(newTerms).toEqual(tos2['text']);

    // set the PP back to what it was
    await termsOfServicePage.setTermsOfService(origTerms);
    browser.sleep(2000); // 1000 not enough
    let tos3 = await apiTermsOfService.getTermsOfService();
    expect(origTerms).toEqual(tos3['text']);

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
