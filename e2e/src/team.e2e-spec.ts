import { MainPage } from './main.po';
import { browser, logging, element, by, Key } from 'protractor';
import { TestSupport } from './test-support.po';
import { TeamPage } from './team.po';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Api } from './api.po';

fdescribe('Team page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let teamPage: TeamPage;

  beforeEach(() => {
    page = new MainPage();
    testSupport = new TestSupport(new Api());
    teamPage = new TeamPage({testSupport: testSupport,
                            teamName: testSupport.getTeamName(),
                            creator: testSupport.normalUser,
                            addedPerson: testSupport.normalUser2});
  });


  xit('should not show Delete Team button when creating the team', async () => {
    expect(false).toBeTruthy('test not written yet');
    // reason: the team hasn't been created yet, so Delete Team button doesn't make sense
  })


  xit('should let leaders assign/unassign other leaders', async () => {
    expect(false).toBeTruthy('test not written yet');
  })


  xit('should prevent non-leaders from assigning/unassigning other leaders', async () => {
    expect(false).toBeTruthy('test not written yet');
  })


  xit('should alert leaders if they are about to revoke their leadership role', () => {
    expect(false).toBeTruthy('write this test');
    // need a ok/cancel modal to alert the user that he is about to revoke his leadership role
  })


  xit('should prevent non-leaders from editing the team attributes', () => {
    expect(false).toBeTruthy('write this test');
    // show a label, not a text field containing the team name
    // don't show the save and cancel buttons
  })


  xit('should allow leaders to edit team attributes', () => {
    expect(false).toBeTruthy('write this test');
    // be sure to verify the team name above the member list changes - because right now, it doesn't
  })


  // passed on 7/17/19
  it('should be able to create and delete a team', () => {
    testSupport.login(testSupport.normalUser.phoneNumber);
    browser.sleep(500);
    page.goto('');
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
    teamPage.editTeam();
    teamPage.beginDeleteTeam();
    teamPage.verifyPageOnBeginDelete();

    teamPage.cancelDeleteTeam();
    teamPage.verifyPageOnCancelDeleteTeam();


    // teamPage.verifyMemberListIsDisplayed(); // should no longer display team members after saving a new team

    // clean up
    teamPage.deleteTeam();
    teamPage.verifyPageOnDeleteTeam();
    teamPage.clickLogout();
  });


  // passed on 7/17/19
  it('should be able to add and remove people from a team', () => {
    teamPage.createTeam(testSupport.names[0].phoneNumber);
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.addSomeoneToTeam();
    teamPage.verifyPersonAdded();

    teamPage.beginDeletePerson();
    teamPage.verifyOnBeginDeletePerson();

    teamPage.cancelDeletePerson();
    teamPage.verifyPageOnCancelDeletePerson();

    teamPage.deletePerson();
    teamPage.verifyPageOnDeletePerson();

    // clean up
    teamPage.deleteTeam();
    page.clickLogout();
  })


  // passed on 7/17/19
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


    teamPage.createTeam(testSupport.names[0].phoneNumber);
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


  fit('should prevent non-leaders from adding/removing people', async () => {
    teamPage.createTeamWithTwoPeople(testSupport.names[0].phoneNumber);
    page.clickLogout();

    testSupport.login(testSupport.names[1].phoneNumber); // the "added" person
    browser.sleep(500);
    page.goto('');
    browser.sleep(500);
    page.clickTeams();
    browser.sleep(500);
    teamPage.selectTeam();
    browser.sleep(500);
    teamPage.verifyMemberListIsDisplayed();
    teamPage.verifyMembersCannotBeAdded();
    teamPage.verifyMembersCannotBeRemoved();
    page.clickLogout();

    // clean up
    testSupport.login(testSupport.names[0].phoneNumber);
    page.goto('');
    page.clickTeams();
    teamPage.selectTeam();
    teamPage.editTeam();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  it('should let leaders delete a team', async () => {
    teamPage.createTeamWithTwoPeople(testSupport.names[0].phoneNumber);
    teamPage.deleteTeam();
    teamPage.verifyPageOnDeleteTeam();

    page.clickLogout();
  })


  it('should prevent non-leaders from deleting a team', async () => {
    teamPage.createTeamWithTwoPeople(testSupport.names[0].phoneNumber);
    page.clickLogout();
    testSupport.login(testSupport.names[1].phoneNumber);
    browser.sleep(500);
    page.clickTeams();
    browser.sleep(500);
    teamPage.selectTeam();
    browser.sleep(500);
    teamPage.verifyTeamDeleteLinkDoesNotExist();
    page.clickLogout();

    // clean up
    testSupport.login(testSupport.names[0].phoneNumber);
    page.goto('');
    page.clickTeams();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

});
