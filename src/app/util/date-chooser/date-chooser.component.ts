import { Component, EventEmitter/*, Input*/, Output, Injectable } from '@angular/core';
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

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
    this.emitDate($event);
  }

  dateChanged($event) {
    this.emitDate($event);
  }

  emitDate($event) {
    var d1 = new Date($event.year, $event.month - 1, $event.day);
    var d2 = new Date($event.year, $event.month - 1, $event.day + 1);
    this.dateSelected.emit({date1: d1.getTime(), date2: d2.getTime()});
      console.log('emitDate: d1 = ', d1);
  }

}
