import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { Api } from './api.po';

describe('Privacy Policy page', () => {
  let page: MainPage;
  let testSupport: TestSupport;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
  });


  it('should let you edit the privacy policy', async () => {
    // login as admin
    // navigate to the Terms page
    // get the terms
    // edit the terms
    // save the terms
    // navigate away or refresh the page
    // verify new terms
    // set the terms back to what they were
    expect(false).toBeTruthy('need to write this test - see the comments');

    // page.clickLogout();
  });



  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
