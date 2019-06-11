import { browser, by, element, ExpectedConditions } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class PublicPage {
  navigateToHome() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  navigateToLogin() {
    return browser.get(browser.baseUrl+'/login') as Promise<any>;
  }

  async enterPhone(phone) {
    var el = element(by.name('phoneNumber'))
    el.sendKeys(phone)


    // console.log('2222222222222');
    // element(by.xpath('//app-login')).getText().then(function(text) {
    //   console.log('text = ', text)
    //   element(by.xpath('//form/div[2]/div')).getText().then(function(t2) {
    //     console.log('//form/div[2]/div = ', t2, ' [END]')
    //   })
    // })
    //
    // browser.sleep(5000);



    // console.log('2222222222222');
    // element(by.xpath('//*[@id="firebaseui-auth-container"]/div/form/div[2]/div')).getText().then(function(text) {
    //   console.log('//*[@id="firebaseui-auth-container"]/div/form/div[2]/div = ', text, ' [END]')
    // })
    //
    // browser.sleep(5000);



    console.log('2222222222222');
    var path = '//*[@id="firebaseui-auth-container"]/div/form/div[2]/div/div[3]/div[1]'
    element(by.xpath(path)).getText().then(function(text) {
      console.log(path+' = ', text, ' [END]')
    })

    browser.sleep(5000);










    // var f1 = element(by.xpath("//iframe[1]")).getWebElement();
    // browser.switchTo().frame(f1);
    // element(by.tagName('span')).getText().then(function(text) {
    //   console.log('text = ', text)
    // })
    //
    // browser.sleep(5000);


    // browser.switchTo().defaultContent();



    // var driver = browser.driver;
    // console.log('11111111111111')
    // var loc = by.tagName('iframe');
    // console.log('2222222222')
    // var f = element(loc)
    // console.log('33333333333  f = ', f)
    // browser.switchTo().frame(f);

    // driver.findElement(by.tagName('body'))
    // var checkbox = driver.element(by.id('recaptcha-checkbox-checkmark'))
    // console.log('checkbox = ', checkbox)
    //
    // // first hover the checkbox
    // browser.actions().mouseMove(checkbox).perform();
    //
    // // hardcoded delay
    // browser.sleep(500);
    //
    // // ok, now click
    // checkbox.click();

  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }
}
