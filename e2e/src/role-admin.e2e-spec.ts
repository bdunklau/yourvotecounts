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

  fit('should be able to view logs by level', () => {
    // db setup - have to log error, info and debug entries so we have something
    // to test
    testSupport.createLogs();

    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickLog();

    adminPage.setLevel('info');
    adminPage.getLogEntries('info').then(function(numbers){
      console.log('For "info", found '+numbers.length+' elements')
      expect(numbers.length > 0).toBeTruthy('expected at least 1 info element');
    });

    adminPage.setLevel('debug');
    adminPage.getLogEntries('debug').then(function(numbers){
      console.log('For "debug", found '+numbers.length+' elements')
      expect(numbers.length > 0).toBeTruthy('expected at least 1 debug element');
    });

    adminPage.setLevel('error');
    adminPage.getLogEntries('error').then(function(numbers){
      console.log('For "error", found '+numbers.length+' elements')
      expect(numbers.length > 0).toBeTruthy('expected at least 1 error element');
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
