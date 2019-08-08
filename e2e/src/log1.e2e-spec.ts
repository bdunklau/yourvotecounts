import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TestSupport } from './test-support.po';
import { LogPage } from './log.po';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Api } from './api.po';

describe('Log page', () => {
  // let page: PublicPage;
  let page: MainPage;
  let testSupport: TestSupport;
  let logPage: LogPage;

  beforeEach(() => {
    testSupport = new TestSupport(new Api());
    page = new MainPage(testSupport);
    logPage = new LogPage(testSupport);
  });

  // passed 8/7
  it('should have a click-able calendar', async () => {
      testSupport.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
      page.pullDownMyMenu();
      page.clickLog();
      // Can't get the value of the datepicker <input> field.  It's not your typical
      // <input> field.  Inspect it via Chrome and you'll see
      logPage.clickCalendarIcon();
      expect(logPage.getCalendar().isPresent()).toBeTruthy('was not able to get the calendar widget to pop up');
      page.clickLogout();
  });



  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
