import { browser, by, element } from 'protractor';

export class TokenPage {
  navigateTo(phoneNumber) {
    browser.waitForAngularEnabled(false);
    return browser.get('https://us-central1-yourvotecounts-bd737.cloudfunctions.net/createCustomToken?phoneNumber='+phoneNumber) as Promise<any>;
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
    this.navigateTo(phoneNumber)
    return this.getToken()
  }
}
