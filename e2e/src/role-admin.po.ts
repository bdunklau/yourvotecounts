import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class AdminPage {
  clickHome() {
    element(by.id('home_link')).click()
    browser.sleep(100);
  }

  clickLog() {
    element(by.id('log_link')).click()
    browser.sleep(1000);
  }

  clickUsers() {
    element(by.id('users_link')).click()
    browser.sleep(1000);
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  logout() {
    element(by.id('logout_link')).click()
    browser.sleep(100);
  }

}
