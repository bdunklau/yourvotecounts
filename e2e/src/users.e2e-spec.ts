import { TestSupport } from './test-support.po';
import { MainPage } from './main.po';
import { UsersPage } from './users.po';
import { browser, logging, /*, element, by*/ } from 'protractor';

describe('Users page', () => {
  let testSupport: TestSupport;
  let page: MainPage;
  let usersPage: UsersPage;

  beforeEach(() => {
    testSupport = new TestSupport();
    page = new MainPage();
    usersPage = new UsersPage();
  });


  it('should be able to get to Users page', () => {
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickUsers();
    expect(usersPage.getSearchByNameField().isPresent()).toBeTruthy('expected the "search by name" field to be present');
    expect(usersPage.getSearchByPhoneField().isPresent()).toBeTruthy('expected the "search by phone" field to be present');
    page.clickLogout();
  });


  it('should be to able to query for users by name', async () => {
    testSupport.setNames(testSupport.names);
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickUsers();
    usersPage.queryByName(testSupport.names[0].displayName);
    var actualName = await usersPage.getNameField();
    expect(actualName === testSupport.names[0].displayName).toBeTruthy('expected the Users page to display the name "'+testSupport.names[0].displayName+'" but actually got: '+actualName);
    page.clickLogout();
  });


  it('should be to able to query for users by phone', async () => {
    testSupport.setNames(testSupport.names);
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickUsers();
    usersPage.queryByPhone(testSupport.names[0].phoneNumber);
    var actualName = await usersPage.getNameField();
    expect(actualName === testSupport.names[0].displayName).toBeTruthy('expected the Users page to display the name "'+testSupport.names[0].displayName+'" but actually got: '+actualName);
    page.clickLogout();
  });


  it('should be to able to query for users by phone', () => {
    expect(false).toBeTruthy();
  });


  it('should be to able to update a user\' name', () => {
    expect(false).toBeTruthy();
  });


  it('should be to able to add/remove roles', () => {
    expect(false).toBeTruthy();
  });


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
