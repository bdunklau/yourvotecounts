import { browser, by, element } from 'protractor';
import { BasePage } from './base.po';
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MainPage extends BasePage {

  constructor(testSupport: TestSupport) { super(testSupport); }

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

  async gotoTestSupport() {
    return await browser.get(browser.baseUrl+'token') // need this?...   as Promise<any>;
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  verifyDisabledPage(pageName: string) {
    expect(this.getElement(by.id('disabled_page')).isDisplayed()).toBeTruthy('The disabled page should have been displayed instead of the '+pageName+' page');
  }

  async verifyMyAccountDisabled() {
    let slp = 1
    await this.clickMyAccount(slp);
    this.verifyDisabledPage('My Account');
  }

  async verifyPagesDisabled(sleep: number) {
    browser.sleep(sleep);
    await this.verifyMyAccountDisabled();
    await  browser.sleep(sleep);
    this.verifyTeamsDisabled();
    // add more as more pages are added
  }

  verifyTeamsDisabled() {
    this.clickTeams();
    this.verifyDisabledPage('Teams');
  }

}
