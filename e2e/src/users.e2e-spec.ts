import { TestSupport } from './test-support.po';
import { MainPage } from './main.po';
import { UsersPage } from './users.po';
import { browser, logging, /*, element, by*/ } from 'protractor';
import { Api } from './api.po';

var verifyUser = async (usersPage, testSupport) => {
  usersPage.queryByName(testSupport.names[0].displayName);
  var actualName = await usersPage.getNameFieldValue();
  expect(actualName === testSupport.names[0].displayName).toBeTruthy('expected the Users page to display the name "'+testSupport.names[0].displayName+'" but actually got: '+actualName);
}

describe('Users page (Admins) ', () => {
  let testSupport: TestSupport;
  let page: MainPage;
  let usersPage: UsersPage;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
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
    var actualName = await usersPage.getNameFieldValue();
    expect(actualName === testSupport.names[0].displayName).toBeTruthy('expected the Users page to display the name "'+testSupport.names[0].displayName+'" but actually got: '+actualName);
    page.clickLogout();
  });


  it('should be to able to query for users by phone', async () => {
    testSupport.setNames(testSupport.names);
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickUsers();
    usersPage.queryByPhone(testSupport.names[0].phoneNumber);
    var actualName = await usersPage.getNameFieldValue();
    expect(actualName === testSupport.names[0].displayName).toBeTruthy('expected the Users page to display the name "'+testSupport.names[0].displayName+'" but actually got: '+actualName);
    var actualPhone = await usersPage.getPhoneLabel();
    expect((actualPhone === testSupport.names[0].phoneNumber)
          || (actualPhone === '+1'+testSupport.names[0].phoneNumber))
      .toBeTruthy('expected the Users page to display the phone number "'+testSupport.names[0].phoneNumber+'" but actually got: '+actualPhone);
    page.clickLogout();
  });


  it('should be able to edit name', async () => {
    testSupport.setName(testSupport.normalUser);
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickUsers();
    usersPage.queryByName(testSupport.normalUser.displayName);
    var expectedName = 'Billy Bob';
    usersPage.setName(expectedName);
    usersPage.clickSubmit();

    // you have to logout and login as this person and go to My Account to really verify
    page.clickLogout();
    testSupport.login(testSupport.normalUser.phoneNumber);
    page.clickHome();
    var currentName = await page.getCurrentUserNameLink().getText()
    expect(currentName == expectedName)
      .toBeTruthy('expected name to be '+expectedName+' but it was '+currentName );
    page.clickLogout();

    // set name back to what it was
    testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickUsers();
    usersPage.queryByName(expectedName);
    usersPage.setName(testSupport.normalUser.displayName);
    usersPage.clickSubmit();
    page.clickLogout();
  });


  xit('should be able to disable any user\'s account', () => {
    testSupport.setNames(testSupport.names);

    // login as Admin
    page.loginAdmin();
    // look up someone's account
    page.clickUsers();
    usersPage.lookUpSomeone();
    // change someone to disabled
    usersPage.disableAccount();
    // logout and login as that person
    page.clickLogout();
    page.loginAsSomeone();
    // verify all routes lead to "disabled"
    page.verifyPagesDisabled();

    page.clickLogout();
    page.loginAsSomeoneElse();
    page.verifyPagesEnabled();
    page.clickLogout();
  })


  xit('should be able to disable everyone else\'s account with one action', () => {
    // login as Admin
    // disable everyone but me
    // logout and login as 2 or 3 other people
    // verify the site displays some kind of "disabled" message
    // verify all routes lead to "disabled" for all affected users
  })


  xit('should not be able to disable your own account', () => {
    // login as Admin
    // look up someone's account
    // change someone to disabled
    // logout and login as that person
    // verify the site displays some kind of "disabled" message
    // verify all routes lead to "disabled"
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
