import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MainPage extends BasePage {

  constructor(private testSupport: TestSupport) {  }

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

  getLoginLink() {
    return this.getElement(by.id('login_link'));
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

  loginAdmin() {
    this.testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
  }

  loginAsSomeone() {
    this.testSupport.login(testSupport.names[0].phoneNumber);
  }

  loginAsSomeoneElse() {
    this.testSupport.login(testSupport.names[1].phoneNumber);
  }

  verifyDisabledPage() {
    expect(element(by.id('disabled_page')).isPresent()).isTruthy('The disabled page should have been displayed but it wasn\'t');
  }

  verifyMyAccountDisabled() {
    this.clickMyAccount();
    this.verifyDisabledPage();
  }

  verifyMyAccountEnabled() {
    this.clickMyAccount();
    // TODO check the page is good
  }

  verifyPagesDisabled() {
    this.verifyMyAccountDisabled();
    this.verifyTeamsDisabled();
    // add more as more pages are added
  }

  verifyPagesEnabled() {
    this.verifyMyAccountEnabled();
    this.verifyTeamsEnabled();
    // add more as more pages are added
  }

  verifyTeamsDisabled() {
    this.clickTeams();
    this.verifyDisabledPage();
  }

  verifyTeamsEnabled() {
    this.clickTeams();
  // TODO check the page is good
  }

  // pullDownMyMenu() {
  //   this.getElement(by.id('name_or_phone')).click();
  // }

}
