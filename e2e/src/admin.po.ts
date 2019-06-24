import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class AdminPage extends BasePage {

  clickCalendarIcon() {
    return this.getElement(by.css('.btn.btn-outline-secondary.calendar')).click();
  }

  getCalendar() {
    return this.getElement(by.tagName('ngb-datepicker'));
  }

  getLevel() {
    return this.getElement(by.id('levelDropdown')).getText();
  }

  getLogEntries(level): ElementArrayFinder {
    browser.sleep(300);
    return this.getElementsByText(level);
  }

  // the <input> holding the date
  // You can set the value but you can't *get* the value of the datepicker <input> field.  It's not your typical
  // <input> field.  Inspect it via Chrome and you'll see
  setDatePickerField(mmddyyyy) {
    var fld = this.getElement(by.css('.form-control.datepicker'));
    fld.clear();
    fld.sendKeys(mmddyyyy);
  }

  setLevel(level) {
    this.getElement(by.id('levelDropdown')).click();
    this.getElement(by.id(level+'Level')).click();
  }

}
