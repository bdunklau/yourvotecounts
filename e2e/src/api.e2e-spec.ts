import { browser, logging, element, by, protractor } from 'protractor';
import { Api } from './api.po';
import { TestSupport } from './test-support.po';
import * as _ from 'lodash';
import * as moment from 'moment';

// These API tests primarily help us support the browser tests
// For example, we may make an API call to set the user's name or online state.
// In order to have confidence in those browser tests, we have to be confident that
// the API calls are working correctly.  That's what these API tests are for.
describe('The API', () => {
  let api: Api;
  let testSupport: TestSupport;

  beforeEach(() => {
    api = new Api();
    testSupport = new TestSupport(api);
  });

  it('should return json for a user', async () => {
    var json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName,
                        phoneNumber: testSupport.names[0].phoneNumber,
                        online: json['online']}, // we can't know what the current online state is, so did this so this assertion will never fail
                      json);

    api.updateDisplayName(json['uid'], json['displayName']+'XXX');
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName+'XXX',
                        phoneNumber: testSupport.names[0].phoneNumber,
                        online: json['online']}, // we can't know what the current online state is, so did this so this assertion will never fail
                      json);


    api.updateDisplayName(json['uid'], testSupport.names[0].displayName);
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName,
                        phoneNumber: testSupport.names[0].phoneNumber,
                        online: json['online']}, // we can't know what the current online state is, so did this so this assertion will never fail
                      json);
  });


  // curl command to verify:
  //  curl -d "displayName=Bre444nt&uid=wMO8BJMNuydKHoNS5pVLY33Dmhi1&online=true" -X POST https://us-central1-yourvotecounts-bd737.cloudfunctions.net/setUser?auth_key=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9
  it('should allow online status to be set', async () => {
    var json = await api.getUser(testSupport.names[0].phoneNumber); // WE DO THIS BECAUSE WE NEED THE ACTUAL UID
    // whatever the online value is, flip it, then flip it back
    let onlineOrig = json['online'];
    let onlineNew = onlineOrig ? false : true;
    api.updateUser({uid: json['uid'],
                    displayName: testSupport.names[0].displayName,
                    online: onlineNew});
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName,
                        phoneNumber: testSupport.names[0].phoneNumber,
                        online: onlineNew},
                      json);

    // reset
    api.updateUser({uid: json['uid'],
                    displayName: testSupport.names[0].displayName,
                    online: onlineOrig});
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyUserJson({displayName: testSupport.names[0].displayName,
                        phoneNumber: testSupport.names[0].phoneNumber,
                        online: onlineOrig},
                      json);
  })


  it('should allow legal to be set', async () => {
    var json = await api.getUser(testSupport.names[0].phoneNumber); // WE DO THIS BECAUSE WE NEED THE ACTUAL UID
    let origTos = json['tosAccepted'];
    let origPp = json['privacyPolicyRead'];
    let tosNew = origTos ? false : true;
    let ppNew = origPp ? false : true;
    testSupport.names[0].uid = json['uid'];
    await api.setLegal(testSupport.names[0], ppNew, tosNew);
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyLegal(ppNew, tosNew, json);

    // reset
    await api.setLegal(testSupport.names[0], origPp, origTos);
    json = await api.getUser(testSupport.names[0].phoneNumber);
    api.verifyLegal(origPp, origTos, json);
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
