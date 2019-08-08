import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { LogPage } from './log.po';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Api } from './api.po';

fdescribe('Log page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let logPage: LogPage;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
    logPage = new LogPage(testSupport);
  });

  // passed 8/7
  fit('should be accessible by hyperlink', async () => {
    await testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    await page.pullDownMyMenu();
    await page.clickLog();
    await browser.sleep(200);
    expect(await page.getTitleText()).toEqual('Log');
    await page.clickLogout();
  });


  it('should be able to convert back and forth between strings and dates', () => {
    var str = "Friday, June 28, 2019";
    var date = logPage.toDate(str, 'dddd, MMMM D, YYYY');
    var str2 = logPage.toDateString(date, 'dddd, MMMM D, YYYY');
    expect(str == str2).toBeTruthy(str+' should have been the same as '+str2);

    var str3 = '06/28/2019';
    var str4 = logPage.toLongDateFormat(str3);
    expect(str4 == str).toBeTruthy(str4+' should have been the same as '+str);
  })


  // passed 8/7
  it('should allow date range to be clicked', async () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.pullDownMyMenu();
    page.clickLog();
    var d1 = logPage.threeDaysBefore();
    var d2 = logPage.threeDaysAfter();
    var d1_short = logPage.threeDaysBefore_short();
    var d2_short = logPage.threeDaysAfter_short();
    logPage.pickFirstDate(d1);
    browser.sleep(500);
    logPage.pickSecondDate(d1, d2);
    browser.sleep(500);
    var exp = d1_short+' to '+d2_short;
    logPage.getDateRangeField().then(actualValue => {
      expect(actualValue == exp).toBeTruthy('expected the date range field to be '+exp+' but it was actually '+actualValue);
      page.clickLogout();
    })
  })



  it('should allow query by user name', async () => {
    logPage.setupQueryByNameTest();
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.pullDownMyMenu();
    page.clickLog();
    var theName = testSupport.names[0].displayName
    logPage.enterUserByName(theName);
    logPage.getNamesInLog().then(function(elements) {
      var promises = [];
      _.forEach(elements, element => {
        promises.push(element.getText());
      })
      Promise.all(promises).then(function(names) {
        _.forEach(names, (name) => {
          expect(theName === name).toBeTruthy('All names in the log should have been '+theName+' but found '+name);
        })
      })
    })

    page.clickLogout();
  })


  it('should allow query by user phone', async () => {
    logPage.setupQueryByNameTest();
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.pullDownMyMenu();
    page.clickLog();
    var phoneNumber = testSupport.names[0].phoneNumber
    logPage.queryForUserByPhone(phoneNumber);
    logPage.getPhonesInLog().then(function(elements) {
      var promises = [];
      _.forEach(elements, element => {
        promises.push(element.getAttribute('title')); // put the phone number in title attribute of <span> tag because the phone number itself is present but hidden on log.component.html
      })
      Promise.all(promises).then(function(phones) {
        _.forEach(phones, (phone) => {
          expect((phoneNumber === phone) || ('+1'+phoneNumber === phone)).toBeTruthy('All phone numbers in the log should have been '+phoneNumber+' but found '+phone);
        })
      })
    })

    page.clickLogout();
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
