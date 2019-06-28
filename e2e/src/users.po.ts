import { BasePage } from './base.po';
import { by } from 'protractor';


// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class UsersPage extends BasePage {

  enterPartialName(name, length) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name.substring(0, length));
  }

  getNameField() {
    return this.getElement(by.id('nameField')).getAttribute('value');
  }

  getSearchByNameField() {
    return this.getElement(by.id('nameSearchField'));
  }

  getSearchByPhoneField() {
    return this.getElement(by.id('phoneSearchField'));
  }

  queryForUser(name) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name);
    this.getElement(by.tagName('ngb-highlight')).click();
  }

}
