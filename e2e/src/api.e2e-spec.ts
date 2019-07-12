import { browser, logging, element, by, protractor } from 'protractor';
import { Api } from './api.po';
import { TestSupport } from './test-support.po';
import * as _ from 'lodash';
import * as moment from 'moment';

describe('The API', () => {
  let api: Api;
  let testSupport: TestSupport;

  beforeEach(() => {
    api = new Api();
    testSupport = new TestSupport(api);
  });

  it('should return json for a user', async () => {
    var json = await api.getUser(testSupport.names[0].phoneNumber);
    // console.log('json = ', json);
    api.verifyUserJson({displayName: testSupport.names[0].displayName, phoneNumber: testSupport.names[0].phoneNumber},
                      json);

    api.updateDisplayName(json['uid'], json['displayName']+'XXX');
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName+'XXX', phoneNumber: testSupport.names[0].phoneNumber},
                      json);


    api.updateDisplayName(json['uid'], testSupport.names[0].displayName);
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName, phoneNumber: testSupport.names[0].phoneNumber},
                      json);
  });


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});