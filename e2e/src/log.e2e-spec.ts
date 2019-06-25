import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { LogPage } from './log.po';
import * as _ from 'lodash';

describe('Log page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let logPage: LogPage;

  beforeEach(() => {
    page = new MainPage();
    testSupport = new TestSupport();
    logPage = new LogPage();
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
    logPage.setupQueryByNameTest(testSupport);
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();

    var run1 = [{displayName: logPage.names[0].displayName,
                  case_sensitive: true,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+logPage.names[0].displayName+' but did not'},
                 {displayName: logPage.names[1].displayName,
                  case_sensitive: true,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+logPage.names[1].displayName+' but did not'},
                 {displayName: 'Mr Fixit',
                  case_sensitive: true,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain Mr Fixit but it did'},
                ];

    // the difference is in the 2nd element
    var run2 = [{displayName: logPage.names[0].displayName,
                  case_sensitive: true,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+logPage.names[0].displayName+' but did not'},
                 {displayName: logPage.names[1].displayName,
                  case_sensitive: true,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain '+logPage.names[1].displayName+' but it did'},
                 {displayName: 'Mr Fixit',
                  case_sensitive: true,
                  expected: false,
                  failMsg: 'Did not expect name dropdown to contain Mr Fixit but it did'},
                ];

    // same as run1, except lower case name
    var run3 = [{displayName: logPage.names[0].displayName.toLowerCase(),
                  case_sensitive: false,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+logPage.names[0].displayName+' but did not (case-insensitive)'},
                 {displayName: logPage.names[1].displayName,
                 case_sensitive: false,
                  expected: true,
                  failMsg: 'Expected name dropdown to contain '+logPage.names[1].displayName+' but did not (case-insensitive)'},
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


  it('should allow query by date', async () => {
    logPage.setupQueryByDateTest(testSupport);

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
    _.forEach(logPage.dates, (date) => {
      logPage.setDatePickerField(date);
      _.forEach(levels, (obj) => {
        var selectedLevel = obj.level;
        logPage.setLevel(selectedLevel);
        _.forEach(obj.levels, (logtype) => {
            logPage.getLogEntries(logtype.level).then(function(numbers){
              //console.log('In '+selectedLevel+' log, found '+numbers.length+' '+logtype.level+' elements')
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

    page.clickLogout()
    testSupport.deleteLogs('test event');
  });


  it('should allow query by user', async () => {
    logPage.setupQueryByNameTest(testSupport);
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    var theName = logPage.names[0].displayName
    logPage.queryForUser(theName);
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

    // clean up
    _.forEach(['dbg event', 'nfo event', 'err event'], (event) => {
      testSupport.deleteLogs(event);
    })
  })


  // TODO move this to its own spec file
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
