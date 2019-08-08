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
  it('should be accessible by hyperlink', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.pullDownMyMenu();
    page.clickLog();
    browser.sleep(200);
    expect(page.getTitleText()).toEqual('Log');
    page.clickLogout();
  });

  // passed 8/7
  it('should have a click-able calendar', async () => {
      testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
      page.pullDownMyMenu();
      page.clickLog();
      // Can't get the value of the datepicker <input> field.  It's not your typical
      // <input> field.  Inspect it via Chrome and you'll see
      logPage.clickCalendarIcon();
      expect(logPage.getCalendar().isPresent()).toBeTruthy('was not able to get the calendar widget to pop up');
      page.clickLogout();
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


  // Write one DEBUG, one INFO and one ERROR entry to the log and verify that the right entries
  // are displayed when we filter the logs by level
  it('should allow query by level', async () => {
      // db setup - have to log error, info and debug entries so we have something to test
      const entries = [
        logPage.debug_user0_tomorrow,
        logPage.info_user0_tomorrow,
        logPage.error_user0_tomorrow,
      ]
      _.each(entries, (log) => {
        testSupport.createLog(log);
      })

      page.loginAdmin();
      page.pullDownMyMenu();
      page.clickLog();
      var actualLevel;
      logPage.setLevel('debug');
      actualLevel = await logPage.getLevel();
      expect(actualLevel === 'debug').toBeTruthy('expected level to be debug, not '+actualLevel);

      // CAN'T CALL ALL THESE IN A LOOP BECAUSE THE CALLBACKS ARE ASYNCHRONOUS - THAT'S A DRAG
      // LEVEL:  DEBUG
      logPage.getLogEntries(logPage.debug_user0_tomorrow.event).then(function(numbers){
        expect(numbers.length === 1).toBeTruthy('expected 1 instance of "'+logPage.debug_user0_tomorrow.event+'" on the debug log but got '+numbers.length);
      });

      logPage.getLogEntries(logPage.info_user0_tomorrow.event).then(function(numbers){
        expect(numbers.length === 1).toBeTruthy('expected 1 instance of "'+logPage.info_user0_tomorrow.event+'" on the debug log but got '+numbers.length);
      });

      logPage.getLogEntries(logPage.error_user0_tomorrow.event).then(function(numbers){
        expect(numbers.length === 1).toBeTruthy('expected 1 instance of "'+logPage.error_user0_tomorrow.event+'" on the debug log but got '+numbers.length);
      });


      // LEVEL:  INFO
      logPage.setLevel('info');
      actualLevel = await logPage.getLevel();
      expect(actualLevel === 'info').toBeTruthy('expected level to be info, not '+actualLevel);
      // We don't test that the debug entry ISN'T present on the INFO screen because the logic for testing not present is different

      logPage.getLogEntries(logPage.info_user0_tomorrow.event).then(function(numbers){
        expect(numbers.length === 1).toBeTruthy('expected 1 instance of "'+logPage.info_user0_tomorrow.event+'" on the info log but got '+numbers.length);
      });

      logPage.getLogEntries(logPage.error_user0_tomorrow.event).then(function(numbers){
        expect(numbers.length === 1).toBeTruthy('expected 1 instance of "'+logPage.error_user0_tomorrow.event+'" on the info log but got '+numbers.length);
      });


      // LEVEL:  ERROR
      logPage.setLevel('error');
      actualLevel = await logPage.getLevel();
      expect(actualLevel === 'error').toBeTruthy('expected level to be error, not '+actualLevel);
      // We don't test that the debug and info entries AREN'T present on the ERROR screen because the logic for testing not present is different

      logPage.getLogEntries(logPage.error_user0_tomorrow.event).then(function(numbers){
        expect(numbers.length === 1).toBeTruthy('expected 1 instance of "'+logPage.error_user0_tomorrow.event+'" on the error log but got '+numbers.length);
      });


      // clean up - delete the entries we wrote in this test
      _.each(entries, (log) => {
        testSupport.deleteLogs({by:'event', value: log.event});
      })
      testSupport.deleteLogs({by:'phoneNumber', value: testSupport.adminUser.phoneNumber}); // deletes the login and logout events so they don't fill up the log screen and cause future false failures
  })


  // passed 8/7
  it('should display correct list of users in dropdown', () => {

    logPage.setupQueryByNameTest();
    // testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.loginAdmin();
    page.pullDownMyMenu();
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
        browser.sleep(500);
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
      testSupport.deleteLogs({by:'event', value: event});
    })

    testSupport.deleteLogs({by:'phoneNumber', value: testSupport.adminUser.phoneNumber}); // deletes the login and logout events so they don't fill up the log screen and cause future false failures
  })



  // passed 7/18/19
  it('should allow query by date', async () => {

    testSupport.setNames(testSupport.names);

    // Create a debug, info and error log entry for 2 users on 2 days
    let logs = [
                logPage.debug_user0_tomorrow,
                logPage.info_user0_tomorrow,
                logPage.error_user0_tomorrow,

                // logPage.debug_user1_tomorrow,
                // logPage.info_user1_tomorrow,
                // logPage.error_user1_tomorrow,

                logPage.debug_user0_dayafter,
                logPage.info_user0_dayafter,
                logPage.error_user0_dayafter,

                // logPage.debug_user1_dayafter,
                // logPage.info_user1_dayafter,
                // logPage.error_user1_dayafter,

                logPage.debug_user0_day3,
                logPage.info_user0_day3,
                logPage.error_user0_day3,

                // logPage.debug_user1_day3,
                // logPage.info_user1_day3,
                // logPage.error_user1_day3
              ]


    // make sure there's nothing hanging around from other tests or prior runs of this test
    _.forEach(logs, (log) => {
      testSupport.deleteLogs({by:'event', value: log.event});
    })


    _.each(logs, (log) => {
      testSupport.createLog(log);
      browser.sleep(250);
    })



    page.loginAdmin();
    var destroyTheEvidence = true;
    page.pullDownMyMenu();
    page.clickLog();



    logPage.pickFirstDate(testSupport.dates[0].from);
    browser.sleep(300);
    logPage.pickSecondDate(testSupport.dates[0].from, testSupport.dates[0].to);
    browser.sleep(300);

    logPage.setLevel('debug');
    logPage.getLogEntries(logPage.debug_user0_tomorrow.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.debug_user0_tomorrow.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.info_user0_tomorrow.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.info_user0_tomorrow.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_tomorrow.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.error_user0_tomorrow.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.debug_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.debug_user0_dayafter.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.info_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.info_user0_dayafter.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.error_user0_dayafter.event+'" on debug log page but got '+numbers.length);
    });



    logPage.setLevel('info');
    logPage.getLogEntries(logPage.info_user0_tomorrow.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.info_user0_tomorrow.event+'" on info log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_tomorrow.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.error_user0_tomorrow.event+'" on info log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.info_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.info_user0_dayafter.event+'" on info log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.error_user0_dayafter.event+'" on info log page but got '+numbers.length);
    });


    logPage.setLevel('error');
    logPage.getLogEntries(logPage.error_user0_tomorrow.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.error_user0_tomorrow.event+'" on error log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[0].from+' to '+testSupport.dates[0].to+', expected 1 instance of "'+logPage.error_user0_dayafter.event+'" on error log page but got '+numbers.length);
    });



    logPage.pickFirstDate(testSupport.dates[1].from);
    browser.sleep(300);
    logPage.pickSecondDate(testSupport.dates[1].from, testSupport.dates[1].to);
    browser.sleep(300);

    logPage.setLevel('debug');
    logPage.getLogEntries(logPage.debug_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.debug_user0_dayafter.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.info_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.info_user0_dayafter.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.error_user0_dayafter.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.debug_user0_day3.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.debug_user0_day3.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.info_user0_day3.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.info_user0_day3.event+'" on debug log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_day3.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.error_user0_day3.event+'" on debug log page but got '+numbers.length);
    });



    logPage.setLevel('info');
    logPage.getLogEntries(logPage.info_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.info_user0_dayafter.event+'" on info log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.error_user0_dayafter.event+'" on info log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.info_user0_day3.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.info_user0_day3.event+'" on info log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_day3.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.error_user0_day3.event+'" on info log page but got '+numbers.length);
    });



    logPage.setLevel('error');
    logPage.getLogEntries(logPage.error_user0_dayafter.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.error_user0_dayafter.event+'" on error log page but got '+numbers.length);
    });

    logPage.getLogEntries(logPage.error_user0_day3.event).then(function(numbers){
      // browser.sleep(250);
      expect(numbers.length === 1).toBeTruthy('For '+testSupport.dates[1].from+' to '+testSupport.dates[1].to+', expected 1 instance of "'+logPage.error_user0_day3.event+'" on error log page but got '+numbers.length);
    });




    // Can't get the value of the datepicker <input> field.  It's not your typical
    // <input> field.  Inspect it via Chrome and you'll see
    page.clickLogout();

    _.forEach(logs, (log) => {
      testSupport.deleteLogs({by:'event', value: log.event});
    })

    testSupport.deleteLogs({by:'phoneNumber', value: testSupport.adminUser.phoneNumber}); // deletes the login and logout events so they don't fill up the log screen and cause future false failures
  })




  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
