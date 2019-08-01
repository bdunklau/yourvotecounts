import { browser, by, element } from 'protractor';
import * as _ from 'lodash';
import { MyAccountPage } from './my-account.po';
import { MainPage } from './main.po';
import * as moment from 'moment';
import { Api } from './api.po';

export class TestSupport {

  constructor(private api: Api) {  }

  normalUser = {displayName: 'Bre444nt',
                phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER,
                uid: '4444444444'}


  normalUser2 = {displayName: 'Bre222nt',
                phoneNumber: process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER2,
                uid: '2222222222'}

  names = [
    this.normalUser,
    this.normalUser2,
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


  dates = [{from: this.tomorrow_mmddyyyy, to: this.dayafter_mmddyyyy},
           {from: this.dayafter_mmddyyyy, to: this.day3_mmddyyyy}];


  createLog(log) {
    browser.waitForAngularEnabled(false);
    var logParm = 'level='+log['level'];
    logParm += '&event='+log['event'];
    logParm += '&uid='+log['uid'];
    logParm += '&displayName='+log['displayName'];
    logParm += '&phoneNumber='+log['phoneNumber'];
    logParm += '&date_ms='+log['date_ms'];
    return browser.get('https://us-central1-yourvotecounts-bd737.cloudfunctions.net/createLog?'+logParm+'&auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY) as Promise<any>;
  }

  createLogs(options: any) {
    browser.waitForAngularEnabled(false);
    var url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/createLogs?auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY;
    if(options.millis) url += '&millis='+options.millis;
    return browser.get(url) as Promise<any>;
  }

  createLogsWithDate(millis) {
    browser.waitForAngularEnabled(false);
    return browser.get('https://us-central1-yourvotecounts-bd737.cloudfunctions.net/createLogs?millis='+millis+'&auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY) as Promise<any>;
  }

  deleteLogs(event) {
    browser.waitForAngularEnabled(false);
    return browser.get('https://us-central1-yourvotecounts-bd737.cloudfunctions.net/deleteLogs?event='+event+'&auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY) as Promise<any>;
  }

  // get a "random" team name
  getTeamName() {
    var ms = new Date().getTime();
    return 'team_'+ms;
  }

  getTitleText() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('h3')).getText() as Promise<string>;
  }

  getToken() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;

    // If this ever throws an not-found error, make sure the user/phone number is actually in the database
    // under the Authentication section
    return element(by.css('h4')).getText() as Promise<string>;
  }

  getError() {
    browser.sleep(100);
    browser.ignoreSynchronization = true;
    return element(by.css('h2')).getText() as Promise<string>;
  }

  login(phoneNumber) {
    this.navigateTo({phoneNumber: phoneNumber, auth_key: process.env.YOURVOTECOUNTS_AUTH_KEY});
    var token = this.getToken();
    browser.get(browser.baseUrl+'/token');
    element(by.name('token')).sendKeys(token);
    element(by.id('submit_token')).click()
    browser.sleep(500); // worked at 1000
  }

  navigateTo(data) {
    var phoneNumber = data.phoneNumber
    var auth_key = data.auth_key ? '&auth_key='+data.auth_key : ''; //'&auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY;
    browser.waitForAngularEnabled(false);
    return browser.get('https://us-central1-yourvotecounts-bd737.cloudfunctions.net/createCustomToken?phoneNumber='+phoneNumber+auth_key) as Promise<any>;
  }

  async setName(obj) {
    // Make an api call and see if we actually need to update the name or not...
    var json = await this.api.getUser(obj.phoneNumber);
    if(json['displayName'] === obj.displayName) {
      // return early, nothing to do
      // console.log('setName(): displayName was already: ', obj.displayName);
    }
    else {
      await this.api.updateDisplayName(json['uid'], obj.displayName);
    }
  }

  // a test prep method that sets users names to whatever we pass in
  setNames(names) {
    _.forEach(names, (obj) => {
      this.setName(obj);
    })
  }

}
