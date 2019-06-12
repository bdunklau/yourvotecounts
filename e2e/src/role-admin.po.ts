import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class AdminPage {
  clickLog() {
    return browser.get(browser.baseUrl+'/log') as Promise<any>;
  }

  clickUsers() {
    return browser.get(browser.baseUrl+'/users') as Promise<any>;
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

}
