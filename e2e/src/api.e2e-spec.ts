import { browser, logging, element, by } from 'protractor';
import { Api } from './api.po';
import { TestSupport } from './test-support.po';
import * as _ from 'lodash';
import * as moment from 'moment';

fdescribe('The API', () => {
  let api: Api;
  let testSupport: TestSupport;

  beforeEach(() => {
    testSupport = new TestSupport();
    api = new Api(testSupport);
  });

  fit('should return json for a user', () => {
    var json = api.getUserJson(testSupport.names[0].phoneNumber);
    // api.verifyUserJson(json);
  });


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
