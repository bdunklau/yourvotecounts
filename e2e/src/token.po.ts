import { browser, by, element } from 'protractor';

export class TokenPage {
  navigateTo(data) {
    var phoneNumber = data.phoneNumber
    var auth_key = data.auth_key ? '&auth_key='+data.auth_key : '';
    browser.waitForAngularEnabled(false);
    return browser.get('https://us-central1-yourvotecounts-bd737.cloudfunctions.net/createCustomToken?phoneNumber='+phoneNumber+auth_key) as Promise<any>;
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('h3')).getText() as Promise<string>;
  }

  getToken() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('h4')).getText() as Promise<string>;
  }

  getError() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('h2')).getText() as Promise<string>;
  }

  login(phoneNumber) {
    this.navigateTo({phoneNumber: phoneNumber, auth_key: process.env.YOURVOTECOUNTS_AUTH_KEY});
    var token = this.getToken();
    browser.get(browser.baseUrl+'/token');
    element(by.name('token')).sendKeys(token);
    element(by.id('submit_token')).click()
    browser.sleep(1000);
  }

}
