import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import * as _ from 'lodash';
import * as moment from 'moment'
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class LogPage extends BasePage {


  clickCalendarIcon() {
    this.getElement(by.css('.btn.btn-outline-secondary.calendar')).click();
  }

  enterPartialName(name, length) {
    var fld = this.getElement(by.id('logName'));
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
    var fld = this.getElement(by.id('logName'));
    fld.clear();
    fld.sendKeys(name);
    this.getElement(by.tagName('ngb-highlight')).click();
  }

  setLevel(level) {
    this.getElement(by.id('levelDropdown')).click();
    this.getElement(by.id(level+'Level')).click();
  }

  names = [
    {displayName: 'Bre222nt', phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER2, uid: '1111111111'},
    {displayName: 'Bre444nt', phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER, uid: '222222222'},
  ]

  fmt = 'MM/DD/YYYY';
  tomorrow = moment(new Date().getTime()).add(1, 'days').toDate();
  tomorrow_ms = this.tomorrow.getTime();
  tomorrow_mmddyyyy = moment(this.tomorrow_ms).format(this.fmt);

  dayafter = moment(new Date().getTime()).add(2, 'days').toDate();
  dayafter_ms = this.dayafter.getTime();
  dayafter_mmddyyyy = moment(this.dayafter_ms).format(this.fmt);

  day3 = moment(new Date().getTime()).add(3, 'days').toDate();
  day3_ms = this.day3.getTime();
  day3_mmddyyyy = moment(this.day3_ms).format(this.fmt);

  // dates = [{from: this.tomorrow_mmddyyyy, to: ' to '+this.dayafter_mmddyyyy},
  //          {from: this.dayafter_mmddyyyy, to: ' to '+this.day3_mmddyyyy}];

  dates = [{from: this.tomorrow_mmddyyyy, to: this.dayafter_mmddyyyy},
           {from: this.dayafter_mmddyyyy, to: this.day3_mmddyyyy}];



  debug_user0_tomorrow = { level: 'debug',
    event: 'dbg event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.tomorrow_ms
  }

  info_user0_tomorrow = { level: 'info',
    event: 'nfo event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.tomorrow_ms
  }

  error_user0_tomorrow = { level: 'error',
    event: 'err event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.tomorrow_ms
  }

  debug_user1_tomorrow = { level: 'debug',
    event: 'dbg event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.tomorrow_ms
  }

  info_user1_tomorrow = { level: 'info',
    event: 'nfo event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.tomorrow_ms
  }

  error_user1_tomorrow = { level: 'error',
    event: 'err event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.tomorrow_ms
  }


  debug_user0_dayafter = { level: 'debug',
    event: 'dbg event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.dayafter_ms
  }

  info_user0_dayafter = { level: 'info',
    event: 'nfo event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.dayafter_ms
  }

  error_user0_dayafter = { level: 'error',
    event: 'err event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.dayafter_ms
  }

  debug_user1_dayafter = { level: 'debug',
    event: 'dbg event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.dayafter_ms
  }

  info_user1_dayafter = { level: 'info',
    event: 'nfo event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.dayafter_ms
  }

  error_user1_dayafter = { level: 'error',
    event: 'err event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.dayafter_ms
  }

  debug_user0_day3 = { level: 'debug',
    event: 'dbg event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.day3_ms
  }

  info_user0_day3 = { level: 'info',
    event: 'nfo event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.day3_ms
  }

  error_user0_day3 = { level: 'error',
    event: 'err event',
    uid: this.names[0]['uid'],
    displayName: this.names[0]['displayName'],
    phoneNumber: this.names[0]['phoneNumber'],
    date_ms: this.day3_ms
  }

  debug_user1_day3 = { level: 'debug',
    event: 'dbg event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.day3_ms
  }

  info_user1_day3 = { level: 'info',
    event: 'nfo event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.day3_ms
  }

  error_user1_day3 = { level: 'error',
    event: 'err event',
    uid: this.names[1]['uid'],
    displayName: this.names[1]['displayName'],
    phoneNumber: this.names[1]['phoneNumber'],
    date_ms: this.day3_ms
  }

  setupQueryByDateTest(testSupport: TestSupport) {

    testSupport.setNames(this.names);

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
      testSupport.createLog(log);
      browser.sleep(500);
    })
  } // setupQueryByDateTest


  setupQueryByNameTest(testSupport: TestSupport) {
    testSupport.setNames(this.names);

    // Create a debug, info and error log entry for 1 user but not the other
    // Make sure we can find the one and not the other when searching
    var logs = [ this.debug_user0_dayafter,
                this.info_user0_dayafter,
                this.error_user0_dayafter,]


    _.forEach(logs, (log) => {
      testSupport.createLog(log);
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
