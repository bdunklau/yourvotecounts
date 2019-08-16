import { browser, by, element, Key, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor'
import { TestSupport } from './test-support.po';
import { BasePage } from './base.po';


// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PrivacyPolicyPage extends BasePage {

  constructor(testSupport: TestSupport)
  {
    super(testSupport);
  }

  async getPrivacyPolicy() {
    browser.sleep(500);
    return this.getElement(by.id('ppField')).getAttribute('value');
  }

  async setPrivacyPolicy(policy: string) {
    this.clear('ppField');
    let field = this.getElement(by.id('ppField'));
    await field.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await field.sendKeys(Key.DELETE);
    field.sendKeys(policy);
    let button = await this.getElement(by.id('submit_pp'))
    button.click();
  }

}
