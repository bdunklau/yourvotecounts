import { browser, by, element, Key } from 'protractor';
import * as protractor from 'protractor';
import * as request from 'request'; // https://stackoverflow.com/questions/45182309/making-an-api-call-while-running-protractor-tests


export class ApiPrivacyPolicy {

  constructor() { }

  async getPrivacyPolicy() {
    var url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/getPrivacyPolicy'; // auth_key not required
    var flow = protractor.promise.controlFlow();
    var result = await flow.execute(function() {
        var defer = protractor.promise.defer();
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                defer.fulfill(JSON.parse(body));
            }
        });
        return defer.promise;
    });
    return result;
  }




}
