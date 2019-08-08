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


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
