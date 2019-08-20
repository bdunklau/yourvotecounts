import { browser, by, element, Key/*, ElementArrayFinder*/ } from 'protractor';
import * as protractor from 'protractor'
import { TestSupport } from './test-support.po';
import { BasePage } from './base.po';


// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class TermsOfServicePage extends BasePage {

  constructor(testSupport: TestSupport)
  {
    super(testSupport);
  }

  async getTermsOfService() {
    browser.sleep(500);
    return this.getElement(by.id('tosField')).getAttribute('value');
  }

  async setTermsOfService(terms: string) {
    this.clear('tosField');
    let field = this.getElement(by.id('tosField'));
    await field.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await field.sendKeys(Key.DELETE);
    field.sendKeys(terms);
    let button = await this.getElement(by.id('submit_tos'))
    button.click();
  }

}
