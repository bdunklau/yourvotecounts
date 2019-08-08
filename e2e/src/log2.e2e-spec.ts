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

      testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
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
