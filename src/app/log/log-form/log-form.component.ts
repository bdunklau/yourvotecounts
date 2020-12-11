import { Component, OnInit } from '@angular/core';
import moment from 'moment'
import { LogService } from '../log.service';
import { NgForm, /*FormControl, FormGroup*/ } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-log-form',
  templateUrl: './log-form.component.html',
  styleUrls: ['./log-form.component.css']
})
export class LogFormComponent implements OnInit {

  levelsValue: string = 'debug,info,error';
  yearValue: number;
  monthValue: string;
  dayValue: string;
  eventValue: string = 'test event';
  countValue: number = 10;
  displayNameValue: string = 'Bre444nt';
  phoneNumberValue: string = '+15555554444';
  uidValue: string = 'fwEFWfEWfwefetERh';
  date: any;
  msString: string;
  doDelete: boolean;

  constructor(private log: LogService,) { }

  ngOnInit() {
    var future = moment().add(4, 'days'); // arbitrary number of days in the future so that hopefully there won't be any log entries there
    this.yearValue = future.year();
    this.monthValue = future.format('M'); // 1-based
    this.dayValue = future.format('DD');
  }

  onSubmit(form: NgForm) {
    if(this.doDelete) {
      this.deleteLogs({by:'event', value: this.eventValue});
      return;
    }

    // figure out what kinds of log entries to write
    var levels = _.split(this.levelsValue, ',');
    this.date = moment().date(parseInt(this.dayValue)).month(parseInt(this.monthValue)).add(-1, 'months').toDate();
    this.msString = this.date.getTime();
    var entries = [];
    _.each(levels, (level) => {
      for(var i=0; i < this.countValue; i++) {
        var entry = {
          event: this.eventValue,
          uid: this.uidValue,
          phoneNumber: this.phoneNumberValue,
          displayName: this.displayNameValue,
          date: moment().date(parseInt(this.dayValue)).month(parseInt(this.monthValue)).add(-1, 'months').toDate(),
          date_ms: moment().date(parseInt(this.dayValue)).month(parseInt(this.monthValue)).add(-1, 'months').toDate().getTime(),
        }
        this.log.logit(entry, level);
      }
    })
  }

  deleteLogs(opts) {
    this.log.deleteLogs(opts);
  }

}
