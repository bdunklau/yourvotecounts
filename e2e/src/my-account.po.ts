import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MyAccountPage extends BasePage {

  clickEdit() {
    // FAIL?  If this fails, you probably don't have a displayName set for the user, just a phone number
    this.getElement(by.id('edit_my_account')).click();
  }

  clickSubmit() {
    this.getElement(by.id("submit_personal_info")).click();
  }

  enterName(name) {
    var fld = this.getNameField();
    fld.clear();
    fld.sendKeys(name);
  }

  getNameField() {
    return this.getElement(by.id('myaccount_name_field'));
  }

  getNameLabel() {
    return this.getElement(by.id('myaccount_name_label'));
  }

  // just a check to make sure we are on this page
  verifyPage() {
    expect(element(by.id('myaccount_page')).isPresent()).toBeTruthy('expected the My Account page to displayed, but it is not');
  }

}
