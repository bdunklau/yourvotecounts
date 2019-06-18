import { browser, by, element } from 'protractor';
import * as protractor from 'protractor'

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class BasePage {


  getElement(locator) {
    var EC=protractor.ExpectedConditions;
    var ele=element(locator);
    browser.wait(EC.visibilityOf(ele),5000,"element never became visible (locator: "+locator+")");
    return ele
  }


  getElements(locator) {
    var elements = element.all(locator)
    browser.wait(this.presenceOfAll(elements), 3000);
    return elements;
  }


  getElementByText(text) {
    return this.getElement(by.xpath("//*[. = '"+text+"']"));
  }


  getElementsByText(text) {
    return this.getElements(by.xpath("//*[. = '"+text+"']"));
  }


  presenceOfAll(elementArrayFinder) {
    return function () {
        return elementArrayFinder.count(function (count) {
            return count > 0;
        });
    };
  }


  pullDownMyMenu() {
    this.getElement(by.id('name_or_phone')).click();
  }

}
