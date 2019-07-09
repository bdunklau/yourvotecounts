import { MainPage } from './main.po';
import { browser, logging, element, by, Key } from 'protractor';
import { TestSupport } from './test-support.po';
import { TeamPage } from './team.po';
import * as _ from 'lodash';
import * as moment from 'moment';

fdescribe('Team page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let teamPage: TeamPage;

  beforeEach(() => {
    page = new MainPage();
    testSupport = new TestSupport();
    teamPage = new TeamPage();
  });


  fit('should be able to create a team', async () => {
    testSupport.login(testSupport.normalUser.phoneNumber);
    browser.sleep(500);
    page.goto('');
    browser.sleep(500);
    page.pullDownMyMenu();
    page.getElement(by.id('teams_link')).click();
    expect(element(by.id('team_name_field')).isPresent()).toBeFalsy('the team name field should not have been displayed because we have not clicked Create Team yet');
    expect(teamPage.getElement(by.id('create_team')).isDisplayed()).toBeTruthy('the Create Team button should be displayed');

    teamPage.getElement(by.id('create_team')).click();
    expect(element(by.id('create_team')).isPresent()).toBeFalsy('the Create Team button should not be displayed.  It should disappear when we click it.');
    expect(teamPage.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should have been displayed because we clicked Create Team button');
    expect(teamPage.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should be displayed but it wasn\'t');
    expect(teamPage.getElement(by.id('save_team')).isEnabled()).toBeFalsy('the save button should be disabled because we have not entered anything into the Team Name field yet');
    expect(teamPage.getElement(by.id('cancel_team')).isDisplayed()).toBeTruthy('the Cancel button should be displayed');
    expect(teamPage.getElement(by.id('cancel_team')).isEnabled()).toBeTruthy('the Cancel button should be enabled');

    var teamName = testSupport.getTeamName();
    teamPage.enterTeamName(teamName);
    // at some point, we'll want to enter more than just the team name
    expect(teamPage.getElement(by.id('save_team')).isEnabled()).toBeTruthy('the save button should be enabled because we entered a Team Name');

    // clear the name field and verify the error is displayed underneath
    var field = teamPage.getElement(by.id('team_name_field'));
    // field.sendKeys(Key.chord(Key.CONTROL, "a"));
    // field.sendKeys(Key.BACK_SPACE);
    field.clear();
    browser.sleep(500);
    field.sendKeys(' ');
    browser.sleep(500);
    field.sendKeys(Key.BACK_SPACE);
    browser.sleep(500);
    expect(teamPage.getElement(by.id('team_name_invalid')).isDisplayed()).toBeTruthy('expected validation error on the team name field to be displayed because the team name field is empty');

    teamPage.enterTeamName(teamName);
    browser.sleep(500);
    expect(element(by.id('team_name_invalid')).isDisplayed()).toBeFalsy('did not expect validation error on the team name field to be displayed because there is now a value in the field');

    teamPage.saveTeam();

    // after saving, verify the form is cleared and the save button is disabled
    expect(teamPage.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should still be displayed after saving');
    expect(await teamPage.getElement(by.id('team_name_field')).getText() === '').toBeTruthy('the team name field should have been empty after saving');
    expect(teamPage.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should have been displayed but it wasn\'t');
    expect(teamPage.getElement(by.id('save_team')).isEnabled()).toBeFalsy('the save button should be disabled because we just saved the team');

    // Verify team is displayed in a list
    var teamIdInList = 'team_in_list_'+teamName
    var teamElement = teamPage.getElement(by.id(teamIdInList));
    expect(teamElement.isPresent()).toBeTruthy('expected the team list to contain an html element with id "'+teamIdInList+'" but did not find it');
    var val = await teamPage.getElement(by.id('team_name_field')).getText();
    expect(val === '').toBeTruthy('the team name field should be empty after creating the team'); // but it was: '+txt);

    // Verify member list is displayed
    var memberIdField = "team_member_"+testSupport.normalUser.displayName;
    expect(teamPage.getElement(by.id(memberIdField)).isPresent()).toBeTruthy('expected the team page to contain an element with id of '+memberIdField+' but it was not present');
    //  ...with a heading containing the team name
    expect(await teamPage.getElement(by.id('team_member_heading')).getText() == 'Members of '+teamName).toBeTruthy('expected the team member list to display this heading "Members of '+teamName+'" but it didn\'t');

    // Delete the team and verify
    var deleteTeamId = "delete_team_"+teamName;
    teamPage.getElement(by.id(deleteTeamId)).click();
    expect(teamPage.getElement(by.id('modal_ok')).isPresent()).toBeTruthy('expected modal to be displayed with an OK button but present');
    expect(teamPage.getElement(by.id('modal_ok')).isDisplayed()).toBeTruthy('expected OK button in modal to be displayed');

    // Cancel the delete - the page should be exactly the same as after the save
    teamPage.getElement(by.id('modal_cancel')).click();
    // verify the form is cleared and the save button is disabled
    expect(teamPage.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should still be displayed after cancelling the delete');
    expect(await teamPage.getElement(by.id('team_name_field')).getText() === '').toBeTruthy('the team name field should have been empty after cancelling the delete');
    expect(teamPage.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should have been displayed but it wasn\'t');
    expect(teamPage.getElement(by.id('save_team')).isEnabled()).toBeFalsy('the save button should be disabled because the form was reset and we just cancelled the delete');

    // Verify team is displayed in a list
    teamElement = teamPage.getElement(by.id(teamIdInList));
    expect(teamElement.isPresent()).toBeTruthy('expected the team list to contain an html element with id "'+teamIdInList+'" but did not find it');
    val = await teamPage.getElement(by.id('team_name_field')).getText();
    expect(val === '').toBeTruthy('the team name field should be empty because we just saved the team then cancelled the delete'); // but it was: '+txt);

    // Verify member list is displayed
    memberIdField = "team_member_"+testSupport.normalUser.displayName;
    expect(teamPage.getElement(by.id(memberIdField)).isPresent()).toBeTruthy('expected the team page to contain an element with id of '+memberIdField+' but it was not present');

    // Delete - now proceed with the delete
    teamPage.getElement(by.id(deleteTeamId)).click();
    teamPage.getElement(by.id('modal_ok')).click();
    browser.sleep(500);
    // Verify - the team member section is gone
    expect(element(by.id('team_member_editor')).isPresent()).toBeFalsy('the team member list should not be displayed because just deleted a team');
    expect(element(by.id(teamIdInList)).isPresent()).toBeFalsy('did not expect the team list to contain this html element id="'+teamIdInList+'" because we just deleted this team');
    expect(element(by.id(memberIdField)).isPresent()).toBeFalsy('did not expect the team page to contain to team member id='+memberIdField+' because we just deleted the '+teamName+' team so we shouldn\'t be displaying the member list.');

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
