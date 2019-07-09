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
    teamPage = new TeamPage({teamName: testSupport.getTeamName(),
                            creator: testSupport.normalUser});
  });


  fit('should be able to create a team', async () => {
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
  })


  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

});
