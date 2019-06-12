import { browser, by, element, ExpectedConditions } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PublicPage {
  navigateToHome() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  navigateToRegister() {
    var ret = browser.get(browser.baseUrl+'/register') as Promise<any>;
    browser.sleep(1000);
    return ret;
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }
  
}
