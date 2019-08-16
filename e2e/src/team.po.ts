import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import * as _ from 'lodash';
import * as moment from 'moment'
import { TestSupport } from './test-support.po';

export class TeamPage extends BasePage {

  constructor(testSupport: TestSupport,
              private args: {teamName: string,
                             creator: {displayName: string, phoneNumber: string, uid: string},
                             addedPerson: {displayName: string, phoneNumber: string, uid: string}
                            })
  {
    super(testSupport);
  }

  addSomeoneToTeam() {
    browser.sleep(500);
    // enter the full name, no partial entry - that is tested elsewhere
    this.enterUserByName(this.args.addedPerson.displayName);
  }

  beginCreateTeam() {
    this.getElement(by.id('create_team')).click();
  }

  beginDeletePerson() {
    var deletePersonId = "delete_team_member_"+this.args.addedPerson.displayName;
    this.getElement(by.id(deletePersonId)).click();
  }

  beginDeleteTeam() {
    var deleteTeamId = "delete_team";
    this.getElement(by.id(deleteTeamId)).click();
  }

  // click cancel on modal dialog
  cancel() {
    this.getElement(by.id('modal_cancel')).click();
  }

  cancelDeletePerson() {
    this.getElement(by.id('modal_cancel')).click();
  }

  cancelDeleteTeam() {
    // Cancel the delete - the page should be exactly the same as after the save
    this.getElement(by.id('modal_cancel')).click();
  }

  clearForm() {
    // clear the name field and verify the error is displayed underneath
    this.clear('team_name_field');
    browser.sleep(500);
  }

  createTeam() {
    this.testSupport.setNames(this.testSupport.names);
    this.loginAsSomeone();
    browser.sleep(300);
    this.clickTeams();
    this.beginCreateTeam();
    this.fillOutForm();
    this.saveTeam();
  }

  createTeamWithTwoPeople() {
    this.createTeam();
    browser.sleep(1000);
    this.selectTeam();
    this.addSomeoneToTeam();
  }

  deletePerson() {
    this.beginDeletePerson();
    this.getElement(by.id('modal_ok')).click();
    browser.sleep(500);
  }

  deleteTeam() {
    this.beginDeleteTeam();
    this.getElement(by.id('modal_ok')).click();
    browser.sleep(500);
  }

  editTeam() {
    this.getElement(by.id('edit_team')).click();
  }

  enterTeamName(name: string) {
    var fld = this.getTeamNameField();
    fld.clear();
    fld.sendKeys(name)
  }

  enterUserByName(name) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name.substring(0, name.length-2));
    this.getElement(by.tagName('ngb-highlight')).click();
  }

  fillOutForm() {
    // var teamName = this.testSupport.getTeamName();
    this.enterTeamName(this.args.teamName);
  }

  getCancelButton() {
    return this.getElement(by.id('cancel_team'));
  }

  getSaveButton() {
    return this.getElement(by.id('save_team'));
  }

  getTeamNameField() {
    return this.getElement(by.id('team_name_field'));
  }

  makeOtherPersonLeader() {
    this.getElement(by.id('leader_switch_'+this.args.addedPerson.displayName)).click();
  }

  // click ok on modal dialog
  ok() {
    this.getElement(by.id('modal_ok')).click();
  }

  saveTeam() {
    this.getSaveButton().click();
  }

  selectTeam() {
    this.getElement(by.id('select_team_'+this.args.teamName)).click();
  }


  setTeamName(newname: string) {
    this.enterTeamName(newname);
    this.saveTeam();
    browser.sleep(1000);
  }


  tryToRevokeMyLeaderAccess() {
    this.getElement(by.id('leader_switch_'+this.args.creator.displayName)).click();
  }


  async verifyCannotRevokeMyLeaderAccess() {
    let title = await this.getElement(by.id('modal-title')).getText();
    expect(title === 'Not Allowed').toBeTruthy('expected there to be a modal dialog with title "Not Allowed" but it was not found');
  }


  async verifyIAmLeader() {
    let checked = await element(by.id('leader_checkbox_'+this.args.creator.displayName)).getAttribute('checked');
    expect(checked).toBeTruthy('expected my leader checkbox/switch to still be true but it was not');
  }

  verifyIAmNotLeader() {
    expect(element(by.id('leader_checkbox_'+this.args.creator.displayName)).isPresent()).toBeFalsy('did not expect my leader checkbox to still be present but it was');
    expect(element(by.id('edit_team')).isPresent()).toBeFalsy('did not expect the Edit Team button to still be present but it was');
  }


  async verifyMemberListIsDisplayed() {
    var memberIdField = "team_member_"+this.args.creator.displayName;
    expect(this.getElement(by.id(memberIdField)).isPresent()).toBeTruthy('expected the team page to contain an element with id of '+memberIdField+' but it was not present');
    //  ...with a heading containing the team name
    expect(await this.getElement(by.id('team_member_heading')).getText() == 'Members').toBeTruthy('expected the team member list to display this heading "Members" but it didn\'t');
  }


  verifyMembersCannotBeAdded() {
    // make sure no delete_team_member_  anywhere on the page
    expect(element(by.id('nameSearchField')).isPresent()).toBeFalsy('unexpectedly found the nameSearchField. Should not have found nameSearchField because the user does not have the permission to add people to the team');
  }


  verifyMembersCannotBeRemoved() {
    // make sure no delete_team_member_  anywhere on the page
    expect(element(by.xpath("//*[contains(., 'delete_team_member_')]")).isPresent()).toBeFalsy('unexpectedly found instances of delete_team_member_Xxxx on the page. Should not have found these because the user does not have the permission to remove people from the team');
  }


  verifyOnBeginDeletePerson() {
    // should be a modal displayed
    expect(this.getElement(by.id('modal_ok')).isPresent()).toBeTruthy('expected modal to be displayed with an OK button but present');
    expect(this.getElement(by.id('modal_ok')).isDisplayed()).toBeTruthy('expected OK button in modal to be displayed');
    expect(this.getElement(by.id('modal_cancel')).isPresent()).toBeTruthy('expected modal to be displayed with a Cancel button but present');
    expect(this.getElement(by.id('modal_cancel')).isDisplayed()).toBeTruthy('expected Cancel button in modal to be displayed');
  }


  verifyPageAfterClearingForm() {
    expect(this.getElement(by.id('team_name_invalid')).isDisplayed()).toBeTruthy('expected validation error on the team name field to be displayed because the team name field is empty');
  }


  verifyPageAfterFillingOutForm() {
    // at some point, we'll want to enter more than just the team name
    expect(this.getElement(by.id('save_team')).isEnabled()).toBeTruthy('the save button should be enabled because we entered a Team Name');
    expect(element(by.id('team_name_invalid')).isDisplayed()).toBeFalsy('did not expect validation error on the team name field to be displayed because there is now a value in the field');
  }


  verifyPageBeforeCreatingTeam() {
    expect(element(by.id('team_name_field')).isPresent()).toBeFalsy('the team name field should not have been displayed because we have not clicked Create Team yet');
    expect(this.getElement(by.id('create_team')).isDisplayed()).toBeTruthy('the Create Team button should be displayed');
  }


  verifyPageOnBeginDelete() {
    // Delete the team and verify
    expect(this.getElement(by.id('modal_ok')).isPresent()).toBeTruthy('expected modal to be displayed with an OK button but present');
    expect(this.getElement(by.id('modal_ok')).isDisplayed()).toBeTruthy('expected OK button in modal to be displayed');
  }


  verifyPageOnCancelDeletePerson() {
    // same page as...
    this.verifyPersonAdded();
  }


  verifyPageOnCancelDeleteTeam() {
    // team_name_field should be displayed
    // team_name_field should contain the team name
    expect(this.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should still be displayed');
    this.getElement(by.id('team_name_field')).getAttribute('value').then(val => {
      expect(val === this.args.teamName).toBeTruthy('the team name field should have contained '+this.args.teamName+' but it actually contained: '+val);
      // save button should be enabled
      // cancel button should be enabled
      // delete button should be enabled
      expect(this.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should have been displayed but it wasn\'t');
      expect(this.getElement(by.id('save_team')).isEnabled()).toBeTruthy('the save button should be enabled');
      // browser.sleep(3000);
      expect(this.getCancelButton().isDisplayed()).toBeTruthy('the cancel button should have been displayed but it wasn\'t');
      expect(this.getCancelButton().isEnabled()).toBeTruthy('the cancel button should be enabled');
      expect(this.getElement(by.id('delete_team')).isDisplayed()).toBeTruthy('the delete button should have been displayed but it wasn\'t');
      expect(this.getElement(by.id('delete_team')).isEnabled()).toBeTruthy('the delete button should be enabled');
    });

  }


  verifyPageOnCreateTeam() {
    expect(this.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should have been displayed because we clicked Create Team button');
    expect(this.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should be displayed but it wasn\'t');
    expect(this.getElement(by.id('save_team')).isEnabled()).toBeFalsy('the save button should be disabled because we have not entered anything into the Team Name field yet');
    expect(this.getCancelButton().isDisplayed()).toBeTruthy('the Cancel button should be displayed');
    expect(this.getCancelButton().isEnabled()).toBeTruthy('the Cancel button should be enabled');
    expect(element(by.id('delete_team')).isPresent()).toBeFalsy('the delete button should not have been displayed because we are creating a new team. Deleting teams only means something after the team has been created.');
    // we DON'T want the team member section to be visible yet...
    expect(element(by.id('team_member_editor')).isPresent()).toBeFalsy('did not expect the team member editor section to be visible. We just started creating a team.');
  }


  verifyPageOnDeletePerson() {
    var teamIdInList = 'team_in_list_'+this.args.teamName;
    var memberIdField = "team_member_"+this.args.addedPerson.displayName;
    expect(this.getElement(by.id('team_member_editor')).isDisplayed()).toBeTruthy('the team member list should still be displayed because we only deleted a team member');
    expect(element(by.id(memberIdField)).isPresent()).toBeFalsy('did not expect the team page to contain to team member id='+memberIdField+' because we just deleted this person');
  }


  // After a team is deleted, the user should see the list of his teams
  verifyPageOnDeleteTeam() {
    // Verify - the team member section is gone
    var teamIdInList = 'team_in_list_'+this.args.teamName;
    var memberIdField = "team_member_"+this.args.creator.displayName;
    expect(element(by.id('team_member_editor')).isPresent()).toBeFalsy('the team member list should not be displayed because just deleted a team');
    expect(element(by.id(teamIdInList)).isPresent()).toBeFalsy('did not expect the team list to contain this html element id="'+teamIdInList+'" because we just deleted this team');
    expect(element(by.id(memberIdField)).isPresent()).toBeFalsy('did not expect the team page to contain to team member id='+memberIdField+' because we just deleted the '+this.args.teamName+' team so we shouldn\'t be displaying the member list.');
  }


  verifyPersonAdded() {
    // verify the person was added
    var id = 'team_member_'+this.args.addedPerson.displayName;
    expect(this.getElement(by.id(id)).isDisplayed()).toBeTruthy('expected this new team member to be found on the page by id attribute, but it wasn\'t: '+id);
    this.getElement(by.id('nameSearchField')).getAttribute('value').then(nm => {
      expect(nm === '').toBeTruthy('expected the nameSearchField in the Team Members section to be empty, but it was actually: '+nm);
    })

    // regression check - verify the person doesn't appear more than once in the member list
    this.getElements(by.id(id)).then(team_members => {
      expect(team_members.length === 1).toBeTruthy('expected to find exactly 1 element with id="'+id+'" but actually found '+team_members.length);
    });
  }


  verifyTeamDoesNotExist() {
    var teamIdInList = 'team_in_list_'+this.args.teamName
    expect(element(by.id(teamIdInList)).isPresent()).toBeFalsy('did not expect the team list to contain '+this.args.teamName+' but it did');
  }


  verifyTeamEditLinkDoesNotExist() {
    expect(element(by.id("edit_team")).isPresent()).toBeFalsy('did not expect the Edit Team button to be present but it was');
  }

  async verifyTeamIsDisplayedInList() {
    var teamIdInList = 'team_in_list_'+this.args.teamName
    var teamElement = this.getElement(by.id(teamIdInList));
    expect(teamElement.isPresent()).toBeTruthy('expected the team list to contain an html element with id "'+teamIdInList+'" but did not find it');
  }

  async verifyTeamName(expected_name: string) {
    let actual_name = await this.getElement(by.id('team_name')).getText();
    expect(actual_name === 'Team: '+expected_name).toBeTruthy('expected the team name to be: '+expected_name+' but it was actually: '+actual_name );
  }

  async verifyWarningOnRevokeMyLeaderAccess() {
    let title = await this.getElement(by.id('modal-title')).getText();
    expect(title === 'Revoke Yourself?').toBeTruthy('expected the modal dialog title to be "Revoke Yourself?" but it was: '+title);
  }

}
