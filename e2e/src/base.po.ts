import { browser, by, element, Key, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor'
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class BasePage {

  testSupport: TestSupport;

  constructor(testSupport: TestSupport)
  {
    this.testSupport = testSupport;
  }

  clear(id) {
    var field = this.getElement(by.id(id));
    field.clear();
    browser.sleep(500);
    field.sendKeys(' ');
    browser.sleep(500);
    field.sendKeys(Key.BACK_SPACE);
  }

  async clickLogout(ms) {
    console.log("about to logout...")
    await browser.sleep(ms);
    await this.pullDownMyMenu();
    await this.getLogoutLink().click();
  }

  async clickMyAccount(ms) {
    console.log("about to go to My Account...")
    await browser.sleep(ms);
    await this.pullDownMyMenu();
    await this.getElement(by.id('myaccount_link')).click();
  }

  clickPrivacyPolicy() {
    this.pullDownMyMenu();
    this.getElement(by.id('privacy_link')).click();
  }

  clickTeams() {
    this.pullDownMyMenu();
    this.getElement(by.id('teams_link')).click();
  }

  clickTerms() {
    this.pullDownMyMenu();
    this.getElement(by.id('terms_link')).click();
  }

  closeNav() {
    this.getElement(by.id('closeNav')).click();
  }

  containsLoginBox() {
    expect(this.getElement(by.id('firebaseui-auth-container')).isDisplayed()).toBeTruthy('expected to find the firebaseui-auth-container element on this page but did not');
  }

  enterUserByName(name) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name);
    this.getElement(by.tagName('ngb-highlight')).click();
  }

  enterPartialName(name, length) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name.substring(0, length));
  }

  getElement(locator) {
    var EC=protractor.ExpectedConditions;
    var ele=element(locator);
    browser.wait(EC.visibilityOf(ele),5000,"element never became visible (locator: "+locator+")");
    return ele
  }


  getElements(locator) {
    var elements = element.all(locator)
    browser.wait(this.presenceOfAll(elements), 3000, "locator: "+locator+" never became present");
    return elements;
  }


  getElementByText(text) {
    return this.getElement(by.xpath("//*[. = '"+text+"']"));
  }


  getElementsByText(text) {
    return this.getElements(by.xpath("//*[. = '"+text+"']"));
  }


  getCurrentUserNameLink() {
    return this.getElement(by.id('name_or_phone'));
  }


  getLogoutLink() {
    return this.getElement(by.id('logout_link'));
  }

  async getLoginLink(ms) {
    console.log("about to check for login link...")
    await browser.sleep(ms);
    await this.getElement(by.id('hamburger_menu_icon')).click();
    return this.getElement(by.id('login_link'));
  }


  getMyAccountElement() {
    return this.getElement(by.id('myaccount_page'));
  }

  getNamesInDropdown(): ElementArrayFinder {
    browser.sleep(300);
    return this.getElements(by.tagName('ngb-highlight'));
  }

  goto(url) {
    return browser.get(browser.baseUrl+url) //as Promise<any>;
  }


  loginAdmin() {
    this.testSupport.login(this.testSupport.adminUser.phoneNumber);
  }

  loginNewUser() {
    this.testSupport.login(this.testSupport.brandNewUser.phoneNumber);
  }

  async loginAs(person: any) {
    this.testSupport.login(person.phoneNumber);
    await this.setLegal(person, true);
    return person;
  }

  async loginAsSomeone() {
    console.log(`logging in as: ${this.testSupport.names[0].displayName}`)
    return await this.loginAs(this.testSupport.names[0]);
    // this.testSupport.login(this.testSupport.names[0].phoneNumber);
    // await this.setLegal(this.testSupport.names[0], true);
    // return this.testSupport.names[0];
  }

  async loginAsSomeoneElse() {
    return await this.loginAs(this.testSupport.names[1]);
    // this.testSupport.login(this.testSupport.names[1].phoneNumber);
  }

  async setLegal(person, accepted: boolean) {
    await this.testSupport.setLegal(person, accepted);
  }


  presenceOfAll(elementArrayFinder) {
    return function () {
        return elementArrayFinder.count(function (count) {
            return count > 0;
        });
    };
  }


  async pullDownMyMenu() {
    await this.getElement(by.id('hamburger_menu_icon')).click();
    await browser.sleep(1000);
  }

}
