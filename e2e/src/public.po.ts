import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PublicPage {

  // gotoBaseUrl() {
  //   return browser.get(browser.baseUrl) as Promise<any>;
  //   browser.sleep(100);
  // }
  //
  // gotoTokenPage() {
  //   return browser.get(browser.baseUrl+'/token') as Promise<any>;
  //   browser.sleep(100);
  // }
  //
  // goto(url) {
  //   return browser.get(browser.baseUrl+url) as Promise<any>;
  //   browser.sleep(100);
  // }
  //
  // clickHome() {
  //   element(by.id('home_link')).click()
  //   browser.sleep(500); // worked at 500
  // }
  //
  // clickRegister() {
  //   element(by.id('register_link')).click()
  //   browser.sleep(500); // lower values don't always work
  // }
  //
  // clickUser() {
  //   element(by.id('user_link')).click()
  // }
  //
  // pullDownMyMenu() {
  //   element(by.id('name_or_phone')).click()
  //   browser.sleep(500);
  // }
  //
  // clickMyAccount() {
  //   this.pullDownMyMenu();
  //   element(by.id('myaccount_link')).click()
  // }
  //
  // getTitleText() {
  //   browser.sleep(100);
  //   browser.ignoreSynchronization = true;
  //   return element(by.css('app-root h1')).getText() as Promise<string>;
  // }
  //
  // logout() {
  //   this.pullDownMyMenu();
  //   element(by.id('logout_link')).click()
  //   browser.sleep(100);
  // }
  //
  // getUrl() {
  //   return browser.getCurrentUrl();
  // }

}
