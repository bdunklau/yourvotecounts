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

  // async nameDropdownContains(name): Promise<boolean> {
  //   var names = await this.getElements(by.tagName('ngb-highlight'))
  //   console.log('names = ', names);
  //   var index = _.findIndex(names, (nameEl) => {
  //     console.log('nameEl.getText() = ', nameEl.getText());
  //     return nameEl.getText() === name;
  //   });
  //   return index != -1;
  // }

  // the <input> holding the date
  // You can set the value but you can't *get* the value of the datepicker <input> field.  It's not your typical
  // <input> field.  Inspect it via Chrome and you'll see
  setDatePickerField(mmddyyyy) {
    var fld = this.getElement(by.css('.form-control.datepicker'));
    fld.clear();
    fld.sendKeys(mmddyyyy);
  }

  setLevel(level) {
    this.getElement(by.id('levelDropdown')).click();
    this.getElement(by.id(level+'Level')).click();
  }


  names = [
    {displayName: 'Brent 2222', phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER2, uid: '1111111111'},
    {displayName: 'Brent Normal', phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER, uid: '222222222'},
  ]

  tomorrow_ms = moment(new Date().getTime()).add(1, 'days').toDate().getTime();
  tomorrow_mmddyyyy = moment(this.tomorrow_ms).format('MM/DD/YYYY');
  dayafter_ms = moment(new Date().getTime()).add(2, 'days').toDate().getTime();
  dayafter_mmddyyyy = moment(this.dayafter_ms).format('MM/DD/YYYY');

  dates = [this.tomorrow_mmddyyyy, this.dayafter_mmddyyyy];

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

  setupQueryByDateTest(testSupport: TestSupport) {

    testSupport.setNames(this.names);

    // Create a debug, info and error log entry for 2 users on 2 days
    var logs = [ this.debug_user0_tomorrow,
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
                this.error_user1_dayafter ]


    _.forEach(logs, (log) => {
      testSupport.createLog(log);
      browser.sleep(500);
    })
  } // setupQueryByDateTest


  setupQueryByNameTest(testSupport: TestSupport) {

    testSupport.setNames(this.names);

    // Create a debug, info and error log entry for 1 user but not the other
    // Make sure we can find the one and not the other when searching
    var logs = [ this.debug_user0_tomorrow,
                this.info_user0_tomorrow,
                this.error_user0_tomorrow,]


    _.forEach(logs, (log) => {
      testSupport.createLog(log);
      browser.sleep(500);
    })

  } // setupQueryByNameTest

}
