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

  async updateDisplayName(uid: string, displayName: string) {
    var url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/setUser?auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY;

    var flow = protractor.promise.controlFlow();
    var result = await flow.execute(function() {
        var defer = protractor.promise.defer();
        request.post({url: url, form: {uid: uid, displayName: displayName}},
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

  async updateUser(form: {uid: string, displayName: string, online: boolean}) {
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

  verifyUserJson(expected: {displayName: string, phoneNumber: string, online: any},
                 actual: any) {
    // expect(expected.uid === actual.uid).toBeTruthy('expected uid to be '+expected.uid+' but it was actually '+actual.uid);
    expect(expected['displayName'] === actual['displayName']).toBeTruthy('expected displayName to be '+expected['displayName']+' but it was actually '+actual['displayName']);
    expect(expected['phoneNumber'] === actual['phoneNumber'] ||
      '+1'+expected['phoneNumber'] === actual['phoneNumber']).toBeTruthy('expected phoneNumber to be '+expected['phoneNumber']+' but it was actually '+actual['phoneNumber']);
    expect(expected['online'] === actual['online']).toBeTruthy('expected online to be '+expected['online']+' but it was actually '+actual['online']);
  }

}
