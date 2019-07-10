import { browser, by, element } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import * as _ from 'lodash';
import * as moment from 'moment'
// import { TestSupport } from './test-support.po';

export class TeamPage extends BasePage {

  constructor(private args: {teamName: string,
                             creator: {displayName: string, phoneNumber: string, uid: string},
                             addedPerson: {displayName: string, phoneNumber: string, uid: string}
                            })
  {
    super();
  }

  addSomeoneToTeam() {
    browser.sleep(500);
    // enter the full name, no partial entry - that is tested elsewhere
    this.enterUserByName(this.args.addedPerson.displayName);


    // THIS IS A BUG - TAKE THIS OUT FIXME
    // HACK - for some reason, only in protractor, we have to click the Edit pencil to make the new team member appear.
    // In real life, the new team member appears as soon as they are selected from the nameSearchField drop-down - weird
    // NOT IDEAL - if the user ever stopped appearing in real life, this test won't catch it TODO
    // this.getElement(by.id('edit_team_'+this.args.teamName)).click();
  }

  beginDeletePerson() {
    var deletePersonId = "delete_team_member_"+this.args.addedPerson.displayName;
    this.getElement(by.id(deletePersonId)).click();
  }

  beginDeleteTeam() {
    var deleteTeamId = "delete_team_"+this.args.teamName;
    this.getElement(by.id(deleteTeamId)).click();
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
    this.getElement(by.id('create_team')).click();
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
    this.getElement(by.id('edit_team_'+this.args.teamName)).click();
  }

  enterPartialName(name, length) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name.substring(0, length));
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

  saveTeam() {
    this.getSaveButton().click();
  }


  async verifyMemberListIsDisplayed() {
    var memberIdField = "team_member_"+this.args.creator.displayName;
    expect(this.getElement(by.id(memberIdField)).isPresent()).toBeTruthy('expected the team page to contain an element with id of '+memberIdField+' but it was not present');
    //  ...with a heading containing the team name
    expect(await this.getElement(by.id('team_member_heading')).getText() == 'Members of '+this.args.teamName).toBeTruthy('expected the team member list to display this heading "Members of '+this.args.teamName+'" but it didn\'t');
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


  async verifyPageOnCancelDeleteTeam() {
    this.verifyTeamEditorSectionIsCorrectAfterSaving()
  }


  verifyPageOnCreateTeam() {
    expect(this.isPresent('create_team')).toBeFalsy('the Create Team button should not be displayed.  It should disappear when we click it.');
    expect(this.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should have been displayed because we clicked Create Team button');
    expect(this.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should be displayed but it wasn\'t');
    expect(this.getElement(by.id('save_team')).isEnabled()).toBeFalsy('the save button should be disabled because we have not entered anything into the Team Name field yet');
    expect(this.getElement(by.id('cancel_team')).isDisplayed()).toBeTruthy('the Cancel button should be displayed');
    expect(this.getElement(by.id('cancel_team')).isEnabled()).toBeTruthy('the Cancel button should be enabled');
    // we DON'T want the team member section to be visible yet...
    expect(element(by.id('team_member_editor')).isPresent()).toBeFalsy('did not expect the team member editor section to be visible. We just started creating a team.');
  }


  verifyPageOnDeletePerson() {
    var teamIdInList = 'team_in_list_'+this.args.teamName;
    var memberIdField = "team_member_"+this.args.addedPerson.displayName;
    expect(this.getElement(by.id('team_member_editor')).isDisplayed()).toBeTruthy('the team member list should still be displayed because we only deleted a team member');
    expect(this.getElement(by.id(teamIdInList)).isDisplayed()).toBeTruthy('expected the team list to contain this html element id="'+teamIdInList+'" because we only deleted a team member');
    expect(element(by.id(memberIdField)).isPresent()).toBeFalsy('did not expect the team page to contain to team member id='+memberIdField+' because we just deleted this person');
  }


  verifyPageOnDeleteTeam() {
    // Verify - the team member section is gone
    var teamIdInList = 'team_in_list_'+this.args.teamName;
    var memberIdField = "team_member_"+this.args.creator.displayName;
    expect(element(by.id('team_member_editor')).isPresent()).toBeFalsy('the team member list should not be displayed because just deleted a team');
    expect(element(by.id(teamIdInList)).isPresent()).toBeFalsy('did not expect the team list to contain this html element id="'+teamIdInList+'" because we just deleted this team');
    expect(element(by.id(memberIdField)).isPresent()).toBeFalsy('did not expect the team page to contain to team member id='+memberIdField+' because we just deleted the '+this.args.teamName+' team so we shouldn\'t be displaying the member list.');
  }


  async verifyPersonAdded() {
    // verify the person was added
    var id = 'team_member_'+this.args.addedPerson.displayName;
    expect(this.getElement(by.id(id)).isDisplayed()).toBeTruthy('expected this new team member to be found on the page by id attribute, but it wasn\'t: '+id);
    var nm = await this.getElement(by.id('nameSearchField')).getText()
    expect(nm === '').toBeTruthy('expected the nameSearchField in the Team Members section to be empty, but it was actually: '+nm);
  }


  async verifyTeamEditorSectionIsCorrectAfterSaving() {
    // after saving, verify the form is cleared and the save button is disabled
    expect(this.getElement(by.id('team_name_field')).isDisplayed()).toBeTruthy('the team name field should still be displayed');
    expect(await this.getElement(by.id('team_name_field')).getText() === '').toBeTruthy('the team name field should have been empty');
    expect(this.getElement(by.id('save_team')).isDisplayed()).toBeTruthy('the save button should have been displayed but it wasn\'t');
    expect(this.getElement(by.id('save_team')).isEnabled()).toBeFalsy('the save button should be disabled');
  }

  async verifyTeamIsDisplayedInList() {
    var teamIdInList = 'team_in_list_'+this.args.teamName
    var teamElement = this.getElement(by.id(teamIdInList));
    expect(teamElement.isPresent()).toBeTruthy('expected the team list to contain an html element with id "'+teamIdInList+'" but did not find it');
    var val = await this.getElement(by.id('team_name_field')).getText();
    expect(val === '').toBeTruthy('the team name field should be empty');
  }

}
