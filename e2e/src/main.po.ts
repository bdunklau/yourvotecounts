import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MainPage extends BasePage {

  clickHome() {
    this.getHomeLink().click()
  }

  clickLog() {
    this.getLogLink().click();
  }

  clickLogout() {
    this.pullDownMyMenu();
    this.getLogoutLink().click();
  }

  clickMyAccount() {
    this.pullDownMyMenu();
    this.getElement(by.id('myaccount_link')).click();
  }

  clickUser() {
    this.getElement(by.id('user_link')).click();
  }

  clickUsers() {
    this.getUsersLink().click();
  }

  getHomeElement() {
    return this.getElement(by.id('home_page'));
  }

  getHomeLink() {
    return this.getElement(by.id('home_link'));
  }

  getLoginLink() {
    return this.getElement(by.id('login_link'));
  }

  getLogLink() {
    return this.getElement(by.id('log_link'));
  }

  getLogoutLink() {
    return this.getElement(by.id('logout_link'));
  }

  getMyAccountElement() {
    return this.getElement(by.id('myaccount_page'));
  }

  getTeamsLink() {
    this.pullDownMyMenu();
    return this.getElement(by.id('teams_link'));
  }

  getTitleText() {
    browser.ignoreSynchronization = true;
    return this.getElement(by.css('app-root h1')).getText() as Promise<string>;
  }

  getTokenLink() {
    // return element(by.xpath("//*[. = 'Token']"));
    return this.getElementByText('Token');
  }

  getUsersLink() {
    return this.getElement(by.id('users_link'));
  }

  gotoTestSupport() {
    return browser.get(browser.baseUrl+'/token') as Promise<any>;
    browser.sleep(100);
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  goto(url) {
    return browser.get(browser.baseUrl+url) as Promise<any>;
    browser.sleep(100);
  }

  // pullDownMyMenu() {
  //   this.getElement(by.id('name_or_phone')).click();
  // }

}
