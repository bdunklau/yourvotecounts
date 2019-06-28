import { BasePage } from './base.po';
import { by } from 'protractor';


// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class UsersPage extends BasePage {

  getSearchByNameField() {
    return this.getElement(by.id('logName'));
  }

  getSearchByPhoneField() {
    return this.getElement(by.id('logPhoneNumber'));
  }

}
