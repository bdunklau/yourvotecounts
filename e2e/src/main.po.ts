import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MainPage extends BasePage {

  constructor(private testSupport: TestSupport) { super(); }

  clickHome() {
    this.getHomeLink().click()
  }

  clickLog() {
    this.getLogLink().click();
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

  getLogLink() {
    return this.getElement(by.id('log_link'));
  }

  // getTeamsLink() {
  //   this.pullDownMyMenu();
  //   return this.getElement(by.id('teams_link'));
  // }

  getTitleText() {
    browser.ignoreSynchronization = true;
    return this.getElement(by.css('app-root h3')).getText() as Promise<string>;
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

  verifyDisabledPage(pageName: string) {
    expect(this.getElement(by.id('disabled_page')).isDisplayed()).toBeTruthy('The disabled page should have been displayed instead of the '+pageName+' page');
  }

  verifyMyAccountDisabled() {
    this.clickMyAccount();
    this.verifyDisabledPage('My Account');
  }

  verifyPagesDisabled(sleep: number) {
    browser.sleep(sleep);
    this.verifyMyAccountDisabled();
      browser.sleep(sleep);
    this.verifyTeamsDisabled();
    // add more as more pages are added
  }

  verifyTeamsDisabled() {
    this.clickTeams();
    this.verifyDisabledPage('Teams');
  }

}
