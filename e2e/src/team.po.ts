import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import * as _ from 'lodash';
import * as moment from 'moment'
import { TestSupport } from './test-support.po';

export class TeamPage extends BasePage {

  async createTeam() {
    var btn = await this.getCreateTeamButton();
    console.log('btn = ', btn);
    btn.click();
  }

  enterTeamName(name: string) {
    var fld = this.getTeamNameField();
    fld.clear();
    fld.sendKeys(name)
  }

  getCreateTeamButton() {
    return this.getElement(by.id('create_team'));
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

}
