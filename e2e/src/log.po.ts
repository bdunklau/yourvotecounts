import { browser, by, element, ElementArrayFinder } from 'protractor';
import * as protractor from 'protractor';
import { BasePage } from './base.po';
import * as _ from 'lodash';
import * as moment from 'moment'
import { TestSupport } from './test-support.po';

// from  https://blog.cloudboost.io/building-your-first-tests-for-angular5-with-protractor-a48dfc225a75
export class LogPage extends BasePage {


  clickCalendarIcon() {
    return this.getElement(by.css('.btn.btn-outline-secondary.calendar')).click();
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

  dates = [];
  setupQueryLogByDateTest(testSupport: TestSupport) {

    var names = [
      {displayName: 'Brent 5555', phoneNumber: process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER, uid: '1111111111'},
      {displayName: 'Brent Normal', phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER, uid: '222222222'},
    ]

    testSupport.setNames(names);

    var tomorrow_ms = moment(new Date().getTime()).add(1, 'days').toDate().getTime();
    var tomorrow_mmddyyyy = moment(tomorrow_ms).format('MM/DD/YYYY');
    var dayafter_ms = moment(new Date().getTime()).add(2, 'days').toDate().getTime();
    var dayafter_mmddyyyy = moment(dayafter_ms).format('MM/DD/YYYY');

    this.dates.push(tomorrow_mmddyyyy);
    this.dates.push(dayafter_mmddyyyy);

    var debug_user0_tomorrow = { level: 'debug',
      event: 'dbg event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var info_user0_tomorrow = { level: 'info',
      event: 'nfo event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var error_user0_tomorrow = { level: 'error',
      event: 'err event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var debug_user1_tomorrow = { level: 'debug',
      event: 'dbg event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var info_user1_tomorrow = { level: 'info',
      event: 'nfo event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var error_user1_tomorrow = { level: 'error',
      event: 'err event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: tomorrow_ms
    }

    var debug_user0_dayafter = { level: 'debug',
      event: 'dbg event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var info_user0_dayafter = { level: 'info',
      event: 'nfo event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var error_user0_dayafter = { level: 'error',
      event: 'err event',
      uid: names[0]['uid'],
      displayName: names[0]['displayName'],
      phoneNumber: names[0]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var debug_user1_dayafter = { level: 'debug',
      event: 'dbg event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var info_user1_dayafter = { level: 'info',
      event: 'nfo event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: dayafter_ms
    }

    var error_user1_dayafter = { level: 'error',
      event: 'err event',
      uid: names[1]['uid'],
      displayName: names[1]['displayName'],
      phoneNumber: names[1]['phoneNumber'],
      date_ms: dayafter_ms
    }

    // Create a debug, info and error log entry for 2 users on 2 days
    var logs = [ debug_user0_tomorrow,
                info_user0_tomorrow,
                error_user0_tomorrow,

                debug_user1_tomorrow,
                info_user1_tomorrow,
                error_user1_tomorrow,

                debug_user0_dayafter,
                info_user0_dayafter,
                error_user0_dayafter,

                debug_user1_dayafter,
                info_user1_dayafter,
                error_user1_dayafter ]


    _.forEach(logs, (log) => {
      testSupport.createLog(log);
      browser.sleep(500);
    })
  } // setupQueryLogByDateTest

}
