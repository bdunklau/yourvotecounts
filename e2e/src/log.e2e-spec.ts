import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { LogPage } from './log.po';
import * as _ from 'lodash';
import * as moment from 'moment';

describe('Log page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let logPage: LogPage;

  beforeEach(() => {
    page = new MainPage();
    testSupport = new TestSupport();
    logPage = new LogPage(testSupport);
  });

  it('should be accessible by hyperlink', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickLog();
    expect(page.getTitleText()).toEqual('Log');
    page.clickLogout();
  });

  it('should have a click-able calendar', async () => {
      testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
      page.clickLog();
      // Can't get the value of the datepicker <input> field.  It's not your typical
      // <input> field.  Inspect it via Chrome and you'll see
      logPage.clickCalendarIcon();
      expect(logPage.getCalendar().isPresent()).toBeTruthy('was not able to get the calendar widget to pop up');
      page.clickLogout();
  })


  it('should display correct list of users in dropdown', async () => {

    logPage.setupQueryByNameTest();
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();

    var run1 = [{displayName: testSupport.names[0].displayName,
                  case_sensitive: true,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+testSupport.names[0].displayName+' but did not'},
                 {displayName: testSupport.names[1].displayName,
                  case_sensitive: true,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+testSupport.names[1].displayName+' but did not'},
                 {displayName: 'Mr Fixit',
                  case_sensitive: true,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain Mr Fixit but it did'},
                ];

    // the difference is in the 2nd element
    var run2 = [{displayName: testSupport.names[0].displayName,
                  case_sensitive: true,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+testSupport.names[0].displayName+' but did not'},
                 {displayName: testSupport.names[1].displayName,
                  case_sensitive: true,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain '+testSupport.names[1].displayName+' but it did'},
                 {displayName: 'Mr Fixit',
                  case_sensitive: true,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain Mr Fixit but it did'},
                ];

    // same as run1, except lower case name
    var run3 = [{displayName: testSupport.names[0].displayName.toLowerCase(),
                  case_sensitive: false,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+testSupport.names[0].displayName+' but did not (case-insensitive)'},
                 {displayName: testSupport.names[1].displayName,
                 case_sensitive: false,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+testSupport.names[1].displayName+' but did not (case-insensitive)'},
                 {displayName: 'Mr Fixit',
                  case_sensitive: false,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain Mr Fixit but it did (case-insensitive)'},
                ];

    var func = function(expecteds, len) {
      logPage.enterPartialName(expecteds[0].displayName, len);
      logPage.getNamesInDropdown().then(function(elements) {
        browser.sleep(1000);
        var promises = [];
        _.forEach(elements, element => {
          promises.push(element.getText());
        })

        Promise.all(promises).then(function(names) {
          for(var i=0; i < expecteds.length; i++) {
            var index = _.findIndex(names, (name) => {
              return expecteds[i].case_sensitive ? name === expecteds[i].displayName : name.toLowerCase() === expecteds[i].displayName.toLowerCase();
            });
            var actual = index != -1;
            expect(actual == expecteds[i].expected).toBeTruthy(expecteds[i].failMsg);
          }
        })
        .catch(function(err) {console.log('ERROR: ', err)})
      })
    }

    // func(run1, 3);

    // Now enter the first 4 chars of name and see if one of the users drops out of the dropdown list
    func(run2, 4);

    // test case-insensitive name search
    func(run3, 3);

    page.clickLogout();

    // clean up
    _.forEach(['dbg event', 'nfo event', 'err event'], (event) => {
      testSupport.deleteLogs(event);
    })
  })


  it('should be able to convert back and forth between strings and dates', () => {
    var str = "Friday, June 28, 2019";
    var date = logPage.toDate(str, 'dddd, MMMM D, YYYY');
    var str2 = logPage.toDateString(date, 'dddd, MMMM D, YYYY');
    expect(str == str2).toBeTruthy(str+' should have been the same as '+str2);

    var str3 = '06/28/2019';
    var str4 = logPage.toLongDateFormat(str3);
    expect(str4 == str).toBeTruthy(str4+' should have been the same as '+str);
  })


  it('should allow date range to be clicked', async () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    var d1 = logPage.threeDaysBefore();
    var d2 = logPage.threeDaysAfter();
    logPage.pickFirstDate(d1);
    browser.sleep(500);
    logPage.pickSecondDate(d2);
    browser.sleep(500);
    var exp = d1+' to '+d2;
    logPage.getDateRangeField().then(actualValue => {
      expect(actualValue == exp).toBeTruthy('expected the date range field to be '+exp+' but it was actually '+actualValue);
      page.clickLogout();
    })
  })


  it('should allow query by date', async () => {

    logPage.setupQueryByDateTest();

    // Since we're just looking for instances of text on the page, we have to remember that
    // the debug, info and error are also found in the level dropdown and the selected level
    // is used as the text of the dropdown.
    var levels = [ {level: 'debug',
                    levels: [
                      {level: 'debug', expected: 6},
                      {level: 'info', expected: 5},
                      {level: 'error', expected: 5},
                    ]},

                   {level: 'info',
                    levels: [
                      {level: 'debug', expected: 1},
                      {level: 'info', expected: 6},
                      {level: 'error', expected: 5},
                    ]},

                   {level: 'error',
                    levels: [
                      {level: 'debug', expected: 1},
                      {level: 'info', expected: 1},
                      {level: 'error', expected: 6},
                    ]}  ]

    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    _.forEach(testSupport.dates, (date) => {
      logPage.pickFirstDate(date.from);
      browser.sleep(300);
      logPage.pickSecondDate(date.to);
      browser.sleep(300);
      _.forEach(levels, (obj) => {
        var selectedLevel = obj.level;
        logPage.setLevel(selectedLevel);
        _.forEach(obj.levels, (logtype) => {
            logPage.getLogEntries(logtype.level).then(function(numbers){
              browser.sleep(500);
              //console.log('In '+selectedLevel+' log, found '+numbers.length+' '+logtype.level+' elements')
              expect(numbers.length == logtype.expected ).toBeTruthy('For '+date.from+' to '+date.to+', expected '+logtype.expected+' instances of "'+logtype.level+'" on '+selectedLevel+' log page but got '+numbers.length);
            });
        })
      })
    })


    // Can't get the value of the datepicker <input> field.  It's not your typical
    // <input> field.  Inspect it via Chrome and you'll see
    page.clickLogout();

    _.forEach(['dbg event', 'nfo event', 'err event'], (event) => {
      testSupport.deleteLogs(event);
    })
  })


  it('should allow query by level', async () => {

    // db setup - have to log error, info and debug entries so we have something to test
    testSupport.createLogs();

    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    var actualLevel;
    logPage.setLevel('error');
    actualLevel = await logPage.getLevel();
    expect(actualLevel === 'error').toBeTruthy('expected level to be error, not '+actualLevel);
    logPage.getLogEntries('error').then(function(numbers){
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on error log page but got '+numbers.length);
    });
    logPage.getLogEntries('info').then(function(numbers){
      expect(numbers.length === 1).toBeTruthy('expected 1 instance of "info" on the error log but got '+numbers.length);
    });
    logPage.getLogEntries('debug').then(function(numbers){
      expect(numbers.length === 1).toBeTruthy('expected 1 instance of "debug" on the error log but got '+numbers.length);
    });


    logPage.setLevel('info');
    actualLevel = await logPage.getLevel();
    expect(actualLevel === 'info').toBeTruthy('expected level to be info, not '+actualLevel);
    logPage.getLogEntries('error').then(function(numbers){
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on info log page but got '+numbers.length);
    });
    logPage.getLogEntries('info').then(function(numbers){
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "info" on info log page but got '+numbers.length);
    });
    logPage.getLogEntries('debug').then(function(numbers){
      expect(numbers.length === 1).toBeTruthy('expected 1 instance of "debug" on the info log but got '+numbers.length);
    });


    logPage.setLevel('debug');
    actualLevel = await logPage.getLevel();
    expect(actualLevel === 'debug').toBeTruthy('expected level to be debug, not '+actualLevel);
    logPage.getLogEntries('error').then(function(numbers){
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on debug log page but got '+numbers.length);
    });
    logPage.getLogEntries('info').then(function(numbers){
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "info" on debug log page but got '+numbers.length);
    });
    logPage.getLogEntries('debug').then(function(numbers){
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "debug" on debug log page but got '+numbers.length);
    });

    page.clickLogout();

    testSupport.deleteLogs('test event');
  });


  it('should allow query by user name', async () => {
    logPage.setupQueryByNameTest();
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    var theName = testSupport.names[0].displayName
    logPage.queryForUserByName(theName);
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
    page.clickLog();
    var phoneNumber = testSupport.names[0].phoneNumber
    logPage.queryForUserByPhone(phoneNumber);
    logPage.getPhonesInLog().then(function(elements) {
      var promises = [];
      _.forEach(elements, element => {
        promises.push(element.getText());
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
