import { MainPage } from './main.po';
import { browser, logging, element, by, Key } from 'protractor';
import { TestSupport } from './test-support.po';
import { TeamPage } from './team.po';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Api } from './api.po';
import { ApiUser } from './api-user.po';

fdescribe('Team page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let teamPage: TeamPage;
  let apiUser: ApiUser;

  beforeEach(() => {
    apiUser = new ApiUser();
    testSupport = new TestSupport(new Api({user:apiUser}));
    page = new MainPage(testSupport);
    teamPage = new TeamPage(testSupport,
                            {teamName: testSupport.getTeamName(),
                             creator: testSupport.normalUser,
                             addedPerson: testSupport.normalUser2});
  });


  /* passed inconsistently*/
  fit('should be able to create and delete a team', () => {
    // testSupport.login(testSupport.normalUser.phoneNumber);
    page.loginAsSomeone();
    var sleep = 300;
    browser.sleep(sleep);
    page.clickTeams();

    teamPage.verifyPageBeforeCreatingTeam();
    teamPage.beginCreateTeam();
    teamPage.verifyPageOnCreateTeam();

    teamPage.fillOutForm();
    teamPage.verifyPageAfterFillingOutForm();

    teamPage.clearForm();
    teamPage.verifyPageAfterClearingForm();

    teamPage.fillOutForm();
    teamPage.verifyPageAfterFillingOutForm();

    teamPage.saveTeam();
    teamPage.verifyTeamIsDisplayedInList();
    // teamPage.verifyMemberListIsDisplayed(); // should no longer display team members after saving a new team

    teamPage.selectTeam();
      browser.sleep(sleep);
    teamPage.editTeam();
      browser.sleep(sleep);
    teamPage.beginDeleteTeam();
      browser.sleep(sleep);
    teamPage.verifyPageOnBeginDelete();

    teamPage.cancelDeleteTeam();
    teamPage.verifyPageOnCancelDeleteTeam();

    // clean up
    teamPage.deleteTeam();
    teamPage.verifyPageOnDeleteTeam();
    teamPage.clickLogout();
  });


   fit('should be able to add and remove people from a team', () => {
    teamPage.createTeam(/*testSupport.names[0].phoneNumber*/);
    teamPage.selectTeam();
    // teamPage.editTeam(); // don't have to click Edit Team to add team members
    teamPage.addSomeoneToTeam();
    teamPage.verifyPersonAdded();

    teamPage.beginDeletePerson();
    teamPage.verifyOnBeginDeletePerson();

    teamPage.cancelDeletePerson();
    teamPage.verifyPageOnCancelDeletePerson();

    teamPage.deletePerson();
    teamPage.verifyPageOnDeletePerson();

    // clean up
    teamPage.editTeam();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  // We have to test the drop down here because it's a different component than the one
  // in the log page.  This one clears its contents when a name is chosen
   it('should display correct list of users in dropdown', async () => {

    // create a team
    // type a few letters into the name field to add someone
    // verify the names displayed all start with the same letters

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


    teamPage.createTeam(/*testSupport.names[0].phoneNumber*/);
    browser.sleep(300);
    teamPage.selectTeam();
    teamPage.enterPartialName(testSupport.names[0].displayName, 3);


    var func = function(expecteds, len) {
      teamPage.enterPartialName(expecteds[0].displayName, len);
      teamPage.getNamesInDropdown().then(function(elements) {
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


    func(run1, 3);

    // Now enter the first 4 chars of name and see if one of the users drops out of the dropdown list
    func(run2, 4);

    // test case-insensitive name search
    func(run3, 3);

    // clean up
    teamPage.editTeam();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  fit('should allow leaders to edit team attributes', () => {
    teamPage.createTeam(/*testSupport.names[0].phoneNumber*/);
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.setTeamName('abc123');  //browser.sleep(5000);
    teamPage.verifyTeamName('abc123');
    // clean up
    teamPage.editTeam();
    teamPage.deleteTeam();
    teamPage.clickLogout();
  })


   fit('should prevent non-leaders from adding/removing people', async () => {
    teamPage.createTeamWithTwoPeople(/*testSupport.names[0].phoneNumber*/);
    page.clickLogout();

    page.loginAsSomeoneElse();   // the "added" person
    browser.sleep(300);
    page.clickTeams();
    browser.sleep(300);
    teamPage.selectTeam();
    browser.sleep(300);
    teamPage.verifyMemberListIsDisplayed();
    teamPage.verifyMembersCannotBeAdded();
    teamPage.verifyMembersCannotBeRemoved();
    page.clickLogout();

    // clean up
    page.loginAsSomeone();
    browser.sleep(300);
    page.clickTeams();
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.deleteTeam();
    page.clickLogout();
  })


   it('should let leaders delete a team', async () => {
    teamPage.createTeamWithTwoPeople(/*testSupport.names[0].phoneNumber*/);
    browser.sleep(300);
    teamPage.makeOtherPersonLeader();
    page.clickLogout();

    // now login as the person that was just made leader
    page.loginAsSomeoneElse();
    browser.sleep(300);
    page.clickTeams();
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.deleteTeam();
    teamPage.verifyPageOnDeleteTeam();
    page.clickLogout();

    // login as original user and make sure the team doesn't exist for him either
    page.loginAsSomeone();
    browser.sleep(300);
    page.clickTeams();
    teamPage.verifyTeamDoesNotExist();
    page.clickLogout();
  })


   it('should prevent non-leaders from editing or deleting a team', () => {
    teamPage.createTeamWithTwoPeople(/*testSupport.names[0].phoneNumber*/);
    page.clickLogout();
    page.loginAsSomeoneElse();
    browser.sleep(300);
    page.clickTeams();
    teamPage.selectTeam();
    teamPage.verifyTeamEditLinkDoesNotExist();
    page.clickLogout();

    // clean up
    page.loginAsSomeone();
    browser.sleep(300);
    page.clickTeams();
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  // failed
   it('should alert leaders if they are about to revoke their leadership role', () => {
    let pause = 1000;
    teamPage.createTeamWithTwoPeople(/*testSupport.names[0].phoneNumber*/);
                                        browser.sleep(500);
    teamPage.makeOtherPersonLeader();
                                        browser.sleep(pause);

    teamPage.tryToRevokeMyLeaderAccess();
                                        browser.sleep(pause);
    teamPage.verifyWarningOnRevokeMyLeaderAccess();
                                        browser.sleep(pause);
    teamPage.cancel();
                                        browser.sleep(pause);
    teamPage.verifyIAmLeader();
                                        browser.sleep(pause);

    teamPage.tryToRevokeMyLeaderAccess();
                                        browser.sleep(pause);
    teamPage.ok();
                                        browser.sleep(pause);
    teamPage.verifyIAmNotLeader();
                                        browser.sleep(pause);
    teamPage.clickLogout();

    // clean up
    page.loginAsSomeoneElse();
    browser.sleep(300);
    page.clickTeams();
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  // failed
   it('should not allow team to be leader-less', () => {
    // create a team with just you
    // try to revoke your own leader access - verify not allowed
    // add someone to the team
    // try to revoke your own leader access - verify not allowed
    teamPage.createTeam(/*testSupport.names[0].phoneNumber*/);
    teamPage.selectTeam();

    teamPage.tryToRevokeMyLeaderAccess();
    teamPage.verifyCannotRevokeMyLeaderAccess();
    teamPage.cancel();
    teamPage.verifyIAmLeader();

    teamPage.tryToRevokeMyLeaderAccess();
    teamPage.verifyCannotRevokeMyLeaderAccess();
    teamPage.ok();
    teamPage.verifyIAmLeader();

    teamPage.addSomeoneToTeam();
    teamPage.tryToRevokeMyLeaderAccess();
    teamPage.verifyCannotRevokeMyLeaderAccess();
    teamPage.ok();
    teamPage.verifyIAmLeader();

    // clean up
    teamPage.editTeam();
    teamPage.deleteTeam();
    teamPage.clickLogout();
  })


  it('should not show Delete Team button when creating the team', async () => {
    expect(true).toBeTruthy('this is covered in "should be able to create and delete a team".  See verifyPageOnCreateTeam()');
    // reason: the team hasn't been created yet, so Delete Team button doesn't make sense
  })


  it('should let leaders assign/unassign other leaders', async () => {
    expect(true).toBeTruthy('this is covered in "should let leaders delete a team". See makeOtherPersonLeader()');
  })


  it('should prevent non-leaders from assigning/unassigning other leaders', async () => {
    expect(true).toBeTruthy('this is covered in "should alert leaders if they are about to revoke their leadership role".  See verifyIAmNotLeader()');
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

});
