import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MyAccountPage extends BasePage {


  constructor(testSupport: TestSupport) { super(testSupport); }


  async clickEdit(ms) {
    // FAIL?  If this fails, you probably don't have a displayName set for the user, just a phone number
    console.log("about to edit My Account...")
    await browser.sleep(ms);
    await this.getElement(by.id('edit_my_account')).click();
  }

  async clickSubmit() {
    await this.getElement(by.id("submit_personal_info")).click();
  }

  async enterName(name) {
    var fld = this.getNameField();
    await fld.clear();
    await fld.sendKeys(name);
  }

  getNameField() {
    return this.getElement(by.id('myaccount_name_field'));
  }

  getNameLabel() {
    return this.getElement(by.id('myaccount_name_label'));
  }

  // just a check to make sure we are on this page
  verifyPage() {
    expect(this.getElement(by.id('myaccount_page')).isPresent()).toBeTruthy('expected the My Account page to be displayed, but it is not');
  }

}
