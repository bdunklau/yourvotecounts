import { BasePage } from './base.po';
import { by } from 'protractor';
import { TestSupport } from './test-support.po';


// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class UsersPage extends BasePage {

  constructor(private args: {testSupport: TestSupport,
                             someone: {displayName: string, phoneNumber: string, uid: string},
                             someoneElse: {displayName: string, phoneNumber: string, uid: string}
                            })
  {
    super();
  }


  clickEnabledCheckbox() {
    this.getElement(by.id('disabled_switch_'+this.args.someone.displayName)).click();
  }


  clickSubmit() {
    this.getElement(by.id("submit_user")).click();
  }

  disableAccount() {
    this.clickEnabledCheckbox();
  }

  disableAll() {
    this.getElement(by.id('disable_everyone')).click();
  }

  enableAll() {
    this.disableAll(); // just a toggle function
  }

  enableAccount() {
    this.clickEnabledCheckbox();
  }

  enterPartialName(name, length) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name.substring(0, length));
  }

  getNameField() {
    return this.getElement(by.id('nameField'));
  }

  async getNameFieldValue() {
    return await this.getNameField().getAttribute('value');
  }

  getPhoneLabel() {
    return this.getElement(by.id('phoneLabel')).getText();
  }

  getSearchByNameField() {
    return this.getElement(by.id('nameSearchField'));
  }

  getSearchByPhoneField() {
    return this.getElement(by.id('phoneSearchField'));
  }

  lookUpSomeone() {
    this.queryByName(this.args.someone.displayName);
  }

  queryByName(name) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name);
    this.getElement(by.tagName('ngb-highlight')).click();
  }

  queryByPhone(name) {
    var fld = this.getElement(by.id('phoneSearchField'));
    fld.clear();
    fld.sendKeys(name);
    this.getElement(by.tagName('ngb-highlight')).click();
  }

  async setName(name: string) {
    var fld = this.getNameField();
    await fld.clear();
    fld.sendKeys(name);
  }

}
