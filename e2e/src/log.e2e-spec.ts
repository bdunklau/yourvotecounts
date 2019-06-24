import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { AdminPage } from './admin.po';
import * as moment from 'moment'
import * as _ from 'lodash';

describe('Admins', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let adminPage: AdminPage;

  beforeEach(() => {
    page = new MainPage();
    testSupport = new TestSupport();
    adminPage = new AdminPage();
  });

  it('should be able to get to Log page', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickLog();
    expect(page.getTitleText()).toEqual('Log');
    page.clickLogout();
  });

  it('should should be able to click calendar', async () => {
      testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
      page.clickLog();
      // Can't get the value of the datepicker <input> field.  It's not your typical
      // <input> field.  Inspect it via Chrome and you'll see
      adminPage.clickCalendarIcon();
      expect(adminPage.getCalendar().isPresent()).toBeTruthy('was not able to get the calendar widget to pop up');
      page.clickLogout();
  })

  it('should should be able to query Log by date', async () => {
    var names = [
      {displayName: 'Brent 5555', phoneNumber: process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER, uid: '1111111111'},
      {displayName: 'Brent Normal', phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER, uid: '222222222'},
    ]
    testSupport.setNames(names);

    var tomorrow_ms = moment(new Date().getTime()).add(1, 'days').toDate().getTime();
    var tomorrow_mmddyyyy = moment(tomorrow_ms).format('MM/DD/YYYY');
    var dayafter_ms = moment(new Date().getTime()).add(2, 'days').toDate().getTime();
    var dayafter_mmddyyyy = moment(dayafter_ms).format('MM/DD/YYYY');

    var dates = [ tomorrow_mmddyyyy, dayafter_mmddyyyy ]

    var debug_user0_tomorrow = { level: 'debug',
      event: 'dbg event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var info_user0_tomorrow = { level: 'info',
      event: 'nfo event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var error_user0_tomorrow = { level: 'error',
      event: 'err event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var debug_user1_tomorrow = { level: 'debug',
      event: 'dbg event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var info_user1_tomorrow = { level: 'info',
      event: 'nfo event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var error_user1_tomorrow = { level: 'error',
      event: 'err event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var debug_user0_dayafter = { level: 'debug',
      event: 'dbg event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var info_user0_dayafter = { level: 'info',
      event: 'nfo event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var error_user0_dayafter = { level: 'error',
      event: 'err event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var debug_user1_dayafter = { level: 'debug',
      event: 'dbg event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var info_user1_dayafter = { level: 'info',
      event: 'nfo event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var error_user1_dayafter = { level: 'error',
      event: 'err event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: dayafter_ms
    }

    // Create a debug, info and error log entry for 2 users on 2 days
    var logs = [ debug_user0_tomorrow,
                info_user0_tomorrow,
                error_user0_tomorrow,

                debug_user1_tomorrow,
                info_user1_tomorrow,
                error_user1_tomorrow,

                debug_user0_dayafter,
                info_user0_dayafter,
                error_user0_dayafter,

                debug_user1_dayafter,
                info_user1_dayafter,
                error_user1_dayafter ]

    _.forEach(logs, (log) => {
      testSupport.createLog(log);
      browser.sleep(500);
    })
    // THIS IS THE END OF THE TEST SETUP

    // Since we're just looking for instances of text on the page, we have to remember that
    // the debug, info and error are also found in the level dropdown and the selected level
    // is used as the text of the dropdown.
    var levels = [ {level: 'debug',
                    levels: [
                      {level: 'debug', expected: 4},
                      {level: 'info', expected: 3},
                      {level: 'error', expected: 3},
                    ]},

                   {level: 'info',
                    levels: [
                      {level: 'debug', expected: 1},
                      {level: 'info', expected: 4},
                      {level: 'error', expected: 3},
                    ]},

                   {level: 'error',
                    levels: [
                      {level: 'debug', expected: 1},
                      {level: 'info', expected: 1},
                      {level: 'error', expected: 4},
                    ]}  ]

    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    _.forEach(dates, (date) => {
      adminPage.setDatePickerField(date);
      _.forEach(levels, (obj) => {
        var selectedLevel = obj.level;
        adminPage.setLevel(selectedLevel);
        _.forEach(obj.levels, (logtype) => {
            adminPage.getLogEntries(logtype.level).then(function(numbers){
              console.log('In '+selectedLevel+' log, found '+numbers.length+' '+logtype.level+' elements')
              expect(numbers.length == logtype.expected ).toBeTruthy('expected '+logtype.expected+' instances of "'+logtype.level+'" on '+selectedLevel+' log page but got '+numbers.length);
            });
        })
      })
    })


    // Can't get the value of the datepicker <input> field.  It's not your typical
    // <input> field.  Inspect it via Chrome and you'll see
    page.clickLogout();

    // clean up
    _.forEach(['dbg event', 'nfo event', 'err event'], (event) => {
      testSupport.deleteLogs(event);
    })
  })


  it('should be able to view logs by level', async () => {
    // db setup - have to log error, info and debug entries so we have something
    // to test
    testSupport.createLogs();

    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    var actualLevel;
    adminPage.setLevel('error');
    actualLevel = await adminPage.getLevel();
    expect(actualLevel === 'error').toBeTruthy('expected level to be error, not '+actualLevel);
    adminPage.getLogEntries('error').then(function(numbers){
      console.log('In error log, found '+numbers.length+' error elements')
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on error log page but got '+numbers.length);
    });
    adminPage.getLogEntries('info').then(function(numbers){
      console.log('In error log, found '+numbers.length+' info elements');
      expect(numbers.length === 1).toBeTruthy('expected 1 instance of "info" on the error log but got '+numbers.length);
    });
    adminPage.getLogEntries('debug').then(function(numbers){
      console.log('In error log, found '+numbers.length+' debug elements');
      expect(numbers.length === 1).toBeTruthy('expected 1 instance of "debug" on the error log but got '+numbers.length);
    });


    adminPage.setLevel('info');
    actualLevel = await adminPage.getLevel();
    expect(actualLevel === 'info').toBeTruthy('expected level to be info, not '+actualLevel);
    adminPage.getLogEntries('error').then(function(numbers){
      console.log('In info log, found '+numbers.length+' error elements');
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on info log page but got '+numbers.length);
    });
    adminPage.getLogEntries('info').then(function(numbers){
      console.log('In info log, found '+numbers.length+' info elements');
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "info" on info log page but got '+numbers.length);
    });
    adminPage.getLogEntries('debug').then(function(numbers){
      console.log('In info log, found '+numbers.length+' debug elements');
      expect(numbers.length === 1).toBeTruthy('expected 1 instance of "debug" on the info log but got '+numbers.length);
    });


    adminPage.setLevel('debug');
    actualLevel = await adminPage.getLevel();
    expect(actualLevel === 'debug').toBeTruthy('expected level to be debug, not '+actualLevel);
    adminPage.getLogEntries('error').then(function(numbers){
      console.log('In debug log, found '+numbers.length+' error elements');
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on debug log page but got '+numbers.length);
    });
    adminPage.getLogEntries('info').then(function(numbers){
      console.log('In debug log, found '+numbers.length+' info elements');
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "info" on debug log page but got '+numbers.length);
    });
    adminPage.getLogEntries('debug').then(function(numbers){
      console.log('In debug log, found '+numbers.length+' debug elements');
      expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "debug" on debug log page but got '+numbers.length);
    });

    page.clickLogout()
    testSupport.deleteLogs('test event');
  });

  it('should be able to get to Users page', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickUsers();
    expect(page.getTitleText()).toEqual('Users');
    page.clickLogout()
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
