import { browser, logging, element, by, protractor } from 'protractor';
import { ApiPrivacyPolicy } from './api-privacy-policy.po';
import * as _ from 'lodash';
import * as moment from 'moment';

// These API tests primarily help us support the browser tests
// For example, we may make an API call to set the user's name or online state.
// In order to have confidence in those browser tests, we have to be confident that
// the API calls are working correctly.  That's what these API tests are for.
describe('The Privacy Policy API', () => {
  let apiPrivacyPolicy: ApiPrivacyPolicy;

  beforeEach(() => {
    apiPrivacyPolicy = new ApiPrivacyPolicy();
  });


  it('should be able to get the privacy policy', async () => {
    // make API call to get privacy policy
    // just make sure you get something

    var json = await apiPrivacyPolicy.getPrivacyPolicy();
    expect(json['text'].length > 0).toBeTruthy('woops! got a zero-length privacy policy');
  });



  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
