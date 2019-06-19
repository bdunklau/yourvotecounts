import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class AdminPage extends BasePage {

  getLevel() {
    return this.getElement(by.id('levelDropdown')).getText();
  }

  getLogEntries(level): ElementArrayFinder {
    browser.sleep(3000);
    return this.getElementsByText(level);
  }

  setLevel(level) {
    this.getElement(by.id('levelDropdown')).click();
    this.getElement(by.id(level+'Level')).click();
  }

}
