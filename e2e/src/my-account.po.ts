import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class MyAccountPage {

  getNameField() {
    return element(by.id('myaccount_name'));
  }

}
