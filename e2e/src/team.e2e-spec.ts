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
    teamPage = new TeamPage({teamName: testSupport.getTeamName(),
                            creator: testSupport.normalUser,
                            addedPerson: testSupport.normalUser2});
  });


  fit('should be able to create and delete a team', async () => {
    testSupport.login(testSupport.normalUser.phoneNumber);
    browser.sleep(500);
    page.goto('');
    browser.sleep(500);
    page.clickTeams();

    teamPage.verifyPageBeforeCreatingTeam();
    teamPage.createTeam();
    teamPage.verifyPageOnCreateTeam();

    teamPage.fillOutForm();
    teamPage.verifyPageAfterFillingOutForm();

    teamPage.clearForm();
    teamPage.verifyPageAfterClearingForm();

    teamPage.fillOutForm();
    teamPage.verifyPageAfterFillingOutForm();

    teamPage.saveTeam();
    teamPage.verifyTeamEditorSectionIsCorrectAfterSaving();
    teamPage.verifyTeamIsDisplayedInList();
    teamPage.verifyMemberListIsDisplayed();

    teamPage.beginDeleteTeam();
    teamPage.verifyPageOnBeginDelete();

    teamPage.cancelDeleteTeam();
    teamPage.verifyPageOnCancelDeleteTeam();
    teamPage.verifyTeamIsDisplayedInList();
    teamPage.verifyMemberListIsDisplayed();

    teamPage.deleteTeam();
    teamPage.verifyPageOnDeleteTeam();

    page.clickLogout();
  });


  it('should be able to add and remove people from a team', () => {

    testSupport.setNames(testSupport.names);

    testSupport.login(testSupport.names[0].phoneNumber);
    browser.sleep(500);
    page.goto('');
    browser.sleep(500);

    page.clickTeams();
    teamPage.createTeam();
    teamPage.fillOutForm();
    teamPage.saveTeam();

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


  // We have to test the drop down here because it's a different component than the one
  // in the log page.  This one clears its contents when a name is chosen
  xit('should display correct list of users in dropdown', async () => {
    expect(false).toBeTruthy('test not written yet');
    // see  logPage.getNamesInDropdown()
  })


  it('should not let non-leaders add and remove people', async () => {
    testSupport.setNames(testSupport.names);

    testSupport.login(testSupport.names[0].phoneNumber);
    browser.sleep(500);
    page.goto('');
    browser.sleep(500);

    page.clickTeams();
    teamPage.createTeam();
    teamPage.fillOutForm();
    teamPage.saveTeam();

    teamPage.addSomeoneToTeam();
    page.clickLogout();

    testSupport.login(testSupport.names[1].phoneNumber); // the "added" person
    browser.sleep(500);
    page.goto('');
    browser.sleep(500);
    page.clickTeams();
    browser.sleep(500);
    teamPage.editTeam();
    teamPage.verifyMemberListIsDisplayed();
    teamPage.verifyMembersCannotBeAdded();
    teamPage.verifyMembersCannotBeRemoved();
    page.clickLogout();

    // clean up
    testSupport.login(testSupport.names[0].phoneNumber); // the "added" person
    page.goto('');
    page.clickTeams();
    teamPage.deleteTeam();
    page.clickLogout();
  })


  xit('should not let someone delete a team that did not create it', async () => {
    expect(false).toBeTruthy('test not written yet');
  })


  xit('should let leaders assign/unassign other leaders', async () => {
    expect(false).toBeTruthy('test not written yet');
  })


  xit('should prevent non-leaders from assigning/unassigning other leaders', async () => {
    expect(false).toBeTruthy('test not written yet');
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

});
