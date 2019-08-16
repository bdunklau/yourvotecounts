import { browser, by, element, Key } from 'protractor';
import * as protractor from 'protractor';
import * as request from 'request'; // https://stackoverflow.com/questions/45182309/making-an-api-call-while-running-protractor-tests


export class Api {

  constructor() { }

  async getUser(phoneNumber: string) {

    var url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/getUser?phoneNumber='+phoneNumber+'&auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY;
    var flow = protractor.promise.controlFlow();
    var result = await flow.execute(function() {
        var defer = protractor.promise.defer();
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                defer.fulfill(JSON.parse(body));
            }
        });

        // defer.promise.then(function(data) {
        //    console.log('data = ', data);
        // });

        return defer.promise;
    });


    // console.log('result = ', result);
    // console.log('result[displayName] = ', result['displayName']);
    return result;

  }


  async setLegal(person: any, pp: boolean, tos: boolean) {
    return this.postUser({uid: person.uid, displayName: person.displayName, tosAccepted: tos, privacyPolicyRead: pp});
  }


  async postUser(form) {
    var url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/setUser?auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY;

    var flow = protractor.promise.controlFlow();
    var result = await flow.execute(function() {
        var defer = protractor.promise.defer();
        request.post({url: url, form: form},
          function (error, response, body) {
            if (!error && response.statusCode === 200) {
                defer.fulfill(JSON.parse(body));
            }
          }
        );

        return defer.promise;
    });
    return result;
  }


  async updateDisplayName(uid: string, displayName: string) {
    return this.postUser({uid: uid, displayName: displayName});
  }

  async updateUser(form: {uid: string, displayName: string, online: boolean}) {
    return this.postUser(form);
  }


  verifyUserJson(expected: any /*{displayName: string, phoneNumber: string, online: any}*/,
                 actual: any,
                 marker: string) {
    // expect(expected.uid === actual.uid).toBeTruthy('expected uid to be '+expected.uid+' but it was actually '+actual.uid);
    expect(expected['displayName'] === actual['displayName']).toBeTruthy('expected displayName to be '+expected['displayName']+' but it was actually '+actual['displayName']+' '+marker);
    expect(expected['phoneNumber'] === actual['phoneNumber'] ||
      '+1'+expected['phoneNumber'] === actual['phoneNumber']).toBeTruthy('expected phoneNumber to be '+expected['phoneNumber']+' but it was actually '+actual['phoneNumber']+' '+marker);
    expect(expected['online'] === actual['online']).toBeTruthy('expected online to be '+expected['online']+' but it was actually '+actual['online']+' '+marker);

    expect((expected['tosAccepted'] === actual['tosAccepted']) || (!expected['tosAccepted'] && !actual['tosAccepted']))
      .toBeTruthy('expected tosAccepted to be '+expected['tosAccepted']+' but it was actually '+actual['tosAccepted']+' '+marker);

    expect((expected['privacyPolicyRead'] === actual['privacyPolicyRead']) || (!expected['privacyPolicyRead'] && !actual['privacyPolicyRead']))
      .toBeTruthy('expected privacyPolicyRead to be '+expected['privacyPolicyRead']+' but it was actually '+actual['privacyPolicyRead']+' '+marker);
  }


  verifyLegal(pp: boolean, tos: boolean,
                 actual: any) {

     expect((pp === actual['privacyPolicyRead']) || (!pp && !actual['privacyPolicyRead']))
       .toBeTruthy('expected privacyPolicyRead to be '+pp+' but it was actually '+actual['privacyPolicyRead']);

    expect((tos === actual['tosAccepted']) || (!tos && !actual['tosAccepted']))
      .toBeTruthy('expected tosAccepted to be '+tos+' but it was actually '+actual['tosAccepted']);
  }

}
