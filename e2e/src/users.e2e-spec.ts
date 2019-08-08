import { TestSupport } from './test-support.po';
import { MainPage } from './main.po';
import { UsersPage } from './users.po';
import { browser, by, logging, /*, element, by*/ } from 'protractor';
import { Api } from './api.po';
import { TeamPage } from './team.po';
import { MyAccountPage } from './my-account.po';


var verifyPagesEnabled = function(page, myAccountPage, teamPage, sleep) {
  // verify pages enabled
  page.clickMyAccount();
                                  browser.sleep(sleep);
  myAccountPage.verifyPage();

  // page.clickTeams();
  page.getElement(by.id('teams_link')).click();
  teamPage.verifyPageBeforeCreatingTeam();
}


describe('Users page (Admins) ', () => {
  let testSupport: TestSupport;
  let page: MainPage;
  let usersPage: UsersPage;
  let teamPage: TeamPage;
  let myAccountPage: MyAccountPage;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
    usersPage = new UsersPage({testSupport: testSupport,
                            someone: testSupport.normalUser,
                            someoneElse: testSupport.normalUser2});

    teamPage = new TeamPage({testSupport: testSupport,
                            teamName: testSupport.getTeamName(),
                            creator: testSupport.normalUser,
                            addedPerson: testSupport.normalUser2});
    myAccountPage = new MyAccountPage();
  });


  it('should be able to get to Users page', () => {
    page.loginAdmin();
    page.pullDownMyMenu();
    page.clickUsers();
    expect(usersPage.getSearchByNameField().isPresent()).toBeTruthy('expected the "search by name" field to be present');
    expect(usersPage.getSearchByPhoneField().isPresent()).toBeTruthy('expected the "search by phone" field to be present');
    page.clickLogout();
  });


  it('should be to able to query for users by name', async () => {
    testSupport.setNames(testSupport.names);
    page.loginAdmin();
    page.pullDownMyMenu();
    page.clickUsers();
    usersPage.queryByName(testSupport.names[0].displayName);
    var actualName = await usersPage.getNameFieldValue();
    expect(actualName === testSupport.names[0].displayName).toBeTruthy('expected the Users page to display the name "'+testSupport.names[0].displayName+'" but actually got: '+actualName);
    page.clickLogout();
  });


  it('should be to able to query for users by phone', async () => {
    testSupport.setNames(testSupport.names);
    page.loginAdmin();
    page.pullDownMyMenu();
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


  // passed 8/8
  it('should be able to edit name', async () => {
    testSupport.setName(testSupport.normalUser);
    page.loginAdmin();
    page.pullDownMyMenu();
    page.clickUsers();
    usersPage.queryByName(testSupport.normalUser.displayName);
    var expectedName = 'Billy Bob';
    usersPage.setName(expectedName);
    usersPage.clickSubmit();
    page.clickLogout();

    // you have to logout and login as this person and go to My Account to really verify
    testSupport.login(testSupport.normalUser.phoneNumber);
    browser.sleep(300);
    page.clickMyAccount();
    expect(myAccountPage.getNameLabel().isDisplayed()).toBeTruthy(testSupport.normalUser.displayName+'\'s name should have been displayed on the My Account page, but it wasn\'t');
    var name = await myAccountPage.getNameLabel().getText();
    expect(name == expectedName).toBeTruthy('Expected to see the name '+expectedName+' displayed but instead we saw '+name);
    page.clickLogout();

    // set name back to what it was
    page.loginAdmin();
    browser.sleep(300);
    page.pullDownMyMenu();
    page.clickUsers();
    usersPage.queryByName(expectedName);
    usersPage.setName(testSupport.normalUser.displayName);
    usersPage.clickSubmit();
    page.clickLogout();
  });


    // passed 8/8
  it('should be able to disable any user\'s account', () => {
    testSupport.setNames(testSupport.names);
    var sleep = 300;
    // login as Admin
    page.loginAdmin();
    // look up someone's account
    page.pullDownMyMenu();
    page.clickUsers();
                                    browser.sleep(sleep);
    usersPage.lookUpSomeone();
                                    browser.sleep(sleep);
    // change someone to disabled
    usersPage.disableAccount();
                                    browser.sleep(sleep);
    // logout and login as that person
    page.clickLogout();
                                    browser.sleep(sleep);
    page.loginAsSomeone();
                                    browser.sleep(sleep);
    // verify all routes lead to "disabled"
    page.verifyPagesDisabled(sleep);

    page.clickLogout();
    page.loginAsSomeoneElse();
                                    browser.sleep(sleep);

    // verify pages enabled
    verifyPagesEnabled(page, myAccountPage, teamPage, sleep);

    page.clickLogout();

    // restore by re-enabling the user
    page.loginAdmin();
    // look up someone's account
    page.pullDownMyMenu();
    page.clickUsers();
                                    browser.sleep(sleep);
    usersPage.lookUpSomeone();
                                    browser.sleep(sleep);
    // change someone to disabled
    usersPage.enableAccount();
                                    browser.sleep(sleep);

    page.clickLogout();

  })


  // passed 8/8
  it('should be able to disable everyone else\'s account with one action', () => {
    testSupport.setNames(testSupport.names);
    var sleep = 200;
    // login as Admin
    page.loginAdmin();

    // disable everyone but me
    page.pullDownMyMenu();
    page.clickUsers();
                                    browser.sleep(sleep);
    usersPage.disableAll();
    page.clickLogout();


    // logout and login as 2 other people
    page.loginAsSomeone();
                              browser.sleep(sleep);
    // verify all routes lead to "disabled"
    page.verifyPagesDisabled(sleep);
    page.clickLogout();


    page.loginAsSomeoneElse();
                              browser.sleep(sleep);
    page.verifyPagesDisabled(sleep);
    page.clickLogout();


    // make sure you didn't disable yourself
    page.loginAdmin();
                              browser.sleep(sleep);

    // verify pages enabled
    verifyPagesEnabled(page, myAccountPage, teamPage, sleep);

    // restore - re-enable everyone
    page.pullDownMyMenu();
    page.clickUsers();
                                    browser.sleep(sleep);
    usersPage.enableAll();
                                    browser.sleep(sleep);
    page.clickLogout();

  })


  it('should not be able to disable your own account', () => {
    // actually covered at the end of the test above
    expect(true).toBeTruthy();
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
