import { browser, logging, element, by, protractor } from 'protractor';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';
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

  // beforeEach(() => {
  //   api = new Api({user: new ApiUser()});
  //   testSupport = new TestSupport(api);
  // });


  // curl command to verify:  (NOTE all user attributes may not be present in the example)
  //  curl -d "displayName=Bre444nt&uid=wMO8BJMNuydKHoNS5pVLY33Dmhi1&online=true" -X POST https://us-central1-yourvotecounts-bd737.cloudfunctions.net/setUser?auth_key=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9
  //  it('should be able to get and set user attributes', async () => {
  //   // flip every attribute
  //   // save/verify
  //   // test just updateDisplayName()/verify
  //   // restore/verify
  //
  //   var json = await api.getUser(testSupport.names[0].phoneNumber); // WE DO THIS BECAUSE WE NEED THE ACTUAL UID
  //   testSupport.names[0].uid = json['uid'];
  //   let origName = json['displayName'];
  //   let newName = origName + 'XXX';
  //   let origOnline = json['online'];
  //   let newOnline = origOnline ? false : true;
  //   let origPp = json['privacyPolicyRead'];
  //   let newPp = origPp ? false : true;
  //   let origTos = json['tosAccepted'];
  //   let newTos = origTos ? false : true;
  //   testSupport.names[0].displayName = newName;
  //   testSupport.names[0].online = newOnline;
  //   testSupport.names[0].privacyPolicyRead = newPp;
  //   testSupport.names[0].tosAccepted = newTos;
  //
  //   await api.postUser(testSupport.names[0]);
  //   json = await api.getUser(testSupport.names[0].phoneNumber);
  //   api.verifyUserJson(testSupport.names[0], json, '1111111111');
  //
  //   // testing just updateDisplayName()
  //   testSupport.names[0].displayName = origName+'YYY';
  //   api.updateDisplayName(json['uid'], testSupport.names[0].displayName);
  //   json = await api.getUser(testSupport.names[0].phoneNumber);
  //   api.verifyUserJson(testSupport.names[0], json, '222222222');
  //
  //
  //   // restore and verify
  //   testSupport.names[0].displayName = origName;
  //   testSupport.names[0].online = origOnline;
  //   testSupport.names[0].privacyPolicyRead = origPp;
  //   testSupport.names[0].tosAccepted = origTos;
  //   await api.postUser(testSupport.names[0]);
  //   json = await api.getUser(testSupport.names[0].phoneNumber);
  //   api.verifyUserJson(testSupport.names[0], json, '3333333333');
  // });
  //
  //
  //
  // it('should allow legal to be set', async () => {
  //   // query for values of privacyPolicyRead and tosAccepted
  //   // flip those values
  //   // save/verify
  //   // flip them back
  //   // save/verify
  //
  //   var json = await api.getUser(testSupport.names[0].phoneNumber); // WE DO THIS BECAUSE WE NEED THE ACTUAL UID
  //   let origTos = json['tosAccepted'];
  //   let origPp = json['privacyPolicyRead'];
  //   let tosNew = origTos ? false : true;
  //   let ppNew = origPp ? false : true;
  //   testSupport.names[0].uid = json['uid'];
  //   await api.setLegal(testSupport.names[0], ppNew, tosNew);
  //   json = await api.getUser(testSupport.names[0].phoneNumber);
  //   api.verifyLegal(ppNew, tosNew, json);
  //
  //   // reset
  //   await api.setLegal(testSupport.names[0], origPp, origTos);
  //   json = await api.getUser(testSupport.names[0].phoneNumber);
  //   api.verifyLegal(origPp, origTos, json);
  // })


  // afterEach(async () => {
  //   // Assert that there are no errors emitted from the browser
  //   const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  //   expect(logs).not.toContain(jasmine.objectContaining({
  //     level: logging.Level.SEVERE,
  //   } as logging.Entry));
  // });
});
