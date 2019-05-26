import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    // browser.sleep(5000);
    // browser.ignoreSynchronization = true;
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    browser.sleep(1000);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }
}
