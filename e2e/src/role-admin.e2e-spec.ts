import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { AdminPage } from './admin.po';

fdescribe('Admins', () => {
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
    page.clickLogout()
  });

  fit('should be able to view logs by level', async () => {
    // db setup - have to log error, info and debug entries so we have something
    // to test
    testSupport.createLogs();

    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();
    var actualLevel;
    // adminPage.setLevel('error');
    // actualLevel = await adminPage.getLevel();
    // expect(actualLevel === 'error').toBeTruthy('expected level to be error, not '+actualLevel);
    // adminPage.getLogEntries('error').then(function(numbers){
    //   console.log('In error log, found '+numbers.length+' error elements')
    //   expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on error log page but got '+numbers.length);
    // });
    // adminPage.getLogEntries('info').then(function(numbers){
    //   console.log('In error log, found '+numbers.length+' info elements');
    //   expect(numbers.length === 1).toBeTruthy('expected 1 instance of "info" on the error log but got '+numbers.length);
    // });
    // adminPage.getLogEntries('debug').then(function(numbers){
    //   console.log('In error log, found '+numbers.length+' debug elements');
    //   expect(numbers.length === 1).toBeTruthy('expected 1 instance of "debug" on the error log but got '+numbers.length);
    // });


    // adminPage.setLevel('info');
    // actualLevel = await adminPage.getLevel();
    // expect(actualLevel === 'info').toBeTruthy('expected level to be info, not '+actualLevel);
    // adminPage.getLogEntries('error').then(function(numbers){
    //   console.log('In info log, found '+numbers.length+' error elements');
    //   expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "error" on info log page but got '+numbers.length);
    // });
    // adminPage.getLogEntries('info').then(function(numbers){
    //   console.log('In info log, found '+numbers.length+' info elements');
    //   expect(numbers.length >= 2 ).toBeTruthy('expected at least 2 instances of "info" on info log page but got '+numbers.length);
    // });
    // adminPage.getLogEntries('debug').then(function(numbers){
    //   console.log('In info log, found '+numbers.length+' debug elements');
    //   expect(numbers.length === 1).toBeTruthy('expected 1 instance of "debug" on the info log but got '+numbers.length);
    // });


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
    testSupport.deleteLogs();
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
