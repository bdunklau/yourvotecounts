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


    _.each(logs, (log) => {
      testSupport.createLog(log);
      browser.sleep(250);
    })



    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
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
      testSupport.deleteLogs(log.event);
    })
  })




  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
