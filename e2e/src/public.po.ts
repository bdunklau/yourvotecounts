import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PublicPage {
  clickHome() {
    element(by.id('home_menu_item')).click()
    browser.sleep(100); // worked at 500
  }

  clickRegister() {
    element(by.id('register_menu_item')).click()
    browser.sleep(1000); // lower values don't always work
  }

  clickUser() {
    element(by.id('user_menu_item')).click()
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  logout() {
    element(by.xpath('//*[@id="navbarSupportedContent"]/ul/li[3]/a')).click()
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

}
