import { Component, EventEmitter/*, Input*/, Output, Injectable } from '@angular/core';
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-chooser',
  templateUrl: './date-chooser.component.html',
  styleUrls: ['./date-chooser.component.css'],
})
export class DateChooserComponent {

  model;
  @Output() enteredDate = new EventEmitter<string>();

  // $event is an NgbDate with day, month, year attributes
  select($event) {
    var d1 = new Date($event.year, $event.month - 1, $event.day);
    var d2 = new Date($event.year, $event.month - 1, $event.day + 1);
        console.log('select: ', d2);

    // this.model = $event.item
    // this.enteredDate.emit($event.item.displayName);
  }

  dateChanged($event) {
    var d1 = new Date($event.year, $event.month - 1, $event.day);
    var d2 = new Date($event.year, $event.month - 1, $event.day + 1);
           console.log('dateChanged: ', d2);
    // this.model = $event.item
    // this.enteredDate.emit($event.item.displayName);
  }

}
