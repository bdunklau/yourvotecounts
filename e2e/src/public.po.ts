import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PublicPage {
  clickHome() {
    element(by.id('home_link')).click()
    browser.sleep(500); // worked at 500
  }

  clickRegister() {
    element(by.id('register_link')).click()
    browser.sleep(500); // lower values don't always work
  }

  clickUser() {
    element(by.id('user_link')).click()
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

  getUrl() {
    return browser.getCurrentUrl();
  }

}
