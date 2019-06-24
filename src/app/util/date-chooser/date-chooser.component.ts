import { Component, EventEmitter/*, Input*/, Output, Injectable } from '@angular/core';
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'app-date-chooser',
  templateUrl: './date-chooser.component.html',
  styleUrls: ['./date-chooser.component.css'],
})
export class DateChooserComponent {

  model;
  @Output() dateSelected = new EventEmitter<any>();

  // $event is an NgbDate with day, month, year attributes
  select($event) {
    var d1 = new Date($event.year, $event.month - 1, $event.day);
    var d2 = new Date($event.year, $event.month - 1, $event.day + 1);
    this.dateSelected.emit({date1: d1.getTime(), date2: d2.getTime()});
    // console.log('emitDate: d1 = ', d1);
  }

  // fires when you manually type in a date
  dateChanged($event) {
    var d1 = moment($event, 'MM/DD/YYYY').toDate();
    var d2 = moment($event, 'MM/DD/YYYY').add(1, 'days').toDate();
    this.dateSelected.emit({date1: d1.getTime(), date2: d2.getTime()});
    // console.log('emitDate: d1 = ', d1);
  }

}
