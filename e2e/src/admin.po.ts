import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class AdminPage extends BasePage {

  setLevel(level) {
    var levelDropdown = this.getElement(by.id('levelDropdown'))
  }

  getLogEntries(level): ElementArrayFinder {
    return this.getElementsByText(level);
  }

}
