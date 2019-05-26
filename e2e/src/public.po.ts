import { browser, by, element } from 'protractor';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PublicPage {
  navigateTo() {
    // browser.sleep(5000);
    // browser.ignoreSynchronization = true;
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }
}
