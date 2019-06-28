import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import * as _ from 'lodash';
import * as moment from 'moment'
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class LogPage extends BasePage {

  constructor(private testSupport: TestSupport) {
    super();
  }

  clickCalendarIcon() {
    this.getElement(by.css('.btn.btn-outline-secondary.calendar')).click();
  }

  enterPartialName(name, length) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name.substring(0, length));
  }

  getCalendar() {
    return this.getElement(by.tagName('ngb-datepicker'));
  }

  getDateRangeField() {
    return this.getElement(by.id('dateRange')).getAttribute('value');
  }

  getLevel() {
    return this.getElement(by.id('levelDropdown')).getText();
  }

  getLogEntries(level): ElementArrayFinder {
    browser.sleep(300);
    return this.getElementsByText(level);
  }

  getNamesInDropdown(): ElementArrayFinder {
    browser.sleep(300);
    return this.getElements(by.tagName('ngb-highlight'));
  }

  getNamesInLog(): ElementArrayFinder {
    browser.sleep(300);
    return this.getElements(by.css('.log_displayName'));
  }

  pickFirstDate(mmddyyyy: string) {
    var dt = this.toLongDateFormat(mmddyyyy);
    var aria1 = '[aria-label="'+dt+'"]';
    this.getElement(by.id('dateRange')).click();
    browser.sleep(3000);
    console.log('looking for:  ', aria1)
    this.getElement(by.css(aria1)).click();
  }

  pickSecondDate(mmddyyyy: string) {
    var dt = this.toLongDateFormat(mmddyyyy);
    var aria1 = '[aria-label="'+dt+'"]';
    this.getElement(by.css(aria1)).click();
  }

  queryForUser(name) {
    var fld = this.getElement(by.id('nameSearchField'));
    fld.clear();
    fld.sendKeys(name);
    this.getElement(by.tagName('ngb-highlight')).click();
  }

  setLevel(level) {
    this.getElement(by.id('levelDropdown')).click();
    this.getElement(by.id(level+'Level')).click();
  }



  debug_user0_tomorrow = { level: 'debug',
    event: 'dbg event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.tomorrow_ms
  }

  info_user0_tomorrow = { level: 'info',
    event: 'nfo event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.tomorrow_ms
  }

  error_user0_tomorrow = { level: 'error',
    event: 'err event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.tomorrow_ms
  }

  debug_user1_tomorrow = { level: 'debug',
    event: 'dbg event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.tomorrow_ms
  }

  info_user1_tomorrow = { level: 'info',
    event: 'nfo event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.tomorrow_ms
  }

  error_user1_tomorrow = { level: 'error',
    event: 'err event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.tomorrow_ms
  }


  debug_user0_dayafter = { level: 'debug',
    event: 'dbg event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.dayafter_ms
  }

  info_user0_dayafter = { level: 'info',
    event: 'nfo event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.dayafter_ms
  }

  error_user0_dayafter = { level: 'error',
    event: 'err event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.dayafter_ms
  }

  debug_user1_dayafter = { level: 'debug',
    event: 'dbg event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.dayafter_ms
  }

  info_user1_dayafter = { level: 'info',
    event: 'nfo event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.dayafter_ms
  }

  error_user1_dayafter = { level: 'error',
    event: 'err event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.dayafter_ms
  }

  debug_user0_day3 = { level: 'debug',
    event: 'dbg event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.day3_ms
  }

  info_user0_day3 = { level: 'info',
    event: 'nfo event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.day3_ms
  }

  error_user0_day3 = { level: 'error',
    event: 'err event',
    uid: this.testSupport.names[0]['uid'],
    displayName: this.testSupport.names[0]['displayName'],
    phoneNumber: this.testSupport.names[0]['phoneNumber'],
    date_ms: this.testSupport.day3_ms
  }

  debug_user1_day3 = { level: 'debug',
    event: 'dbg event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.day3_ms
  }

  info_user1_day3 = { level: 'info',
    event: 'nfo event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.day3_ms
  }

  error_user1_day3 = { level: 'error',
    event: 'err event',
    uid: this.testSupport.names[1]['uid'],
    displayName: this.testSupport.names[1]['displayName'],
    phoneNumber: this.testSupport.names[1]['phoneNumber'],
    date_ms: this.testSupport.day3_ms
  }

  setupQueryByDateTest(/*testSupport: TestSupport*/) {

    this.testSupport.setNames(this.testSupport.names);

    // Create a debug, info and error log entry for 2 users on 2 days
    var logs = [
                this.debug_user0_tomorrow,
                this.info_user0_tomorrow,
                this.error_user0_tomorrow,

                this.debug_user1_tomorrow,
                this.info_user1_tomorrow,
                this.error_user1_tomorrow,

                this.debug_user0_dayafter,
                this.info_user0_dayafter,
                this.error_user0_dayafter,

                this.debug_user1_dayafter,
                this.info_user1_dayafter,
                this.error_user1_dayafter,

                this.debug_user0_day3,
                this.info_user0_day3,
                this.error_user0_day3,

                this.debug_user1_day3,
                this.info_user1_day3,
                this.error_user1_day3 ]


    _.forEach(logs, (log) => {
      this.testSupport.createLog(log);
      browser.sleep(500);
    })
  } // setupQueryByDateTest


  setupQueryByNameTest(/*testSupport: TestSupport*/) {
    this.testSupport.setNames(this.testSupport.names);

    // Create a debug, info and error log entry for 1 user but not the other
    // Make sure we can find the one and not the other when searching
    var logs = [ this.debug_user0_dayafter,
                this.info_user0_dayafter,
                this.error_user0_dayafter,]


    _.forEach(logs, (log) => {
      this.testSupport.createLog(log);
      browser.sleep(500);
    })

  } // setupQueryByNameTest


  threeDaysBefore() {
    var date = moment().add(-3, 'days').toDate();
    return this.toDateString(date, 'MM/DD/YYYY');
  }


  threeDaysAfter() {
    var date = moment().add(3, 'days').toDate();
    return this.toDateString(date, 'MM/DD/YYYY');
  }


  toDate(str, format) {
    return moment(str, format).toDate();
  }

  toLongDateFormat(str) {
    var date = this.toDate(str, 'MM/DD/YYYY');
    return this.toDateString(date, 'dddd, MMMM D, YYYY');
  }

  toDateString(date, format) {
    return moment(date).format(format);
  }

}
