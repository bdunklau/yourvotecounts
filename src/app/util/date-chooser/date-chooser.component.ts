import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbDateStruct, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';


@Component({
  selector: 'app-date-chooser',
  templateUrl: './date-chooser.component.html',
  styleUrls: ['./date-chooser.component.css'],
})
export class DateChooserComponent {

    @ViewChild('dp') private datePicker: NgbInputDatepicker;
    @Input() from: Date;
    @Input() to: Date;
    @Input() placeholder = 'starting today';
    @Output() dateRangeSelection = new EventEmitter<{ from: Date, to: Date }>();
    hoveredDate: Date;
    isOpen = false;

    @HostListener('document:click', ['$event.target']) onClick(element) {
      const host = document.getElementById('dateRangePicker');
      if (this.datePicker && this.isOpen && !this.isDescendant(host, element)) {
        this.emit(true);
      }
    }

    constructor() { }

    ngOnInit() {
    }

    private emit(close?: boolean) {
      const dateRange = {
        from: this.from,
        to: this.to,
      };

      this.dateRangeSelection.emit(dateRange);

      if (close) {
        this.isOpen = false;
        this.datePicker.close();
      }
    }

    /**
     * Check whether or not an element is a child of another element
     *
     * @private
     * @param {any} parent
     * @param {any} child
     * @returns if child is a descendant of parent
     * @memberof DateRangeSelectionComponent
     */
    private isDescendant(parent, child) {
      let node = child;
      while (node !== null) {
        if (node === parent) {
          return true;
        } else {
          node = node.parentNode;
        }
      }
      return false;
    }

    get formattedDateRange(): string {
      if (!this.from) {
        return `click to search by date`;
      }

      const fromFormatted = moment(this.from).format('MM/DD/YYYY');

      return this.to
        ? `${fromFormatted}`
        + ` to `
        + `${moment(this.to).format('MM/DD/YYYY')}`
        : `${fromFormatted}`;
    }

    onDateSelection(date: NgbDateStruct) {
      if (!this.from && !this.to) {
        this.from = this.toDate(date);
      } else if (this.from && !this.to && this.toMoment(date).isAfter(this.from)) {
        this.to = this.toDate(date);
        this.emit(true);
      } else {
        this.to = null;
        this.from = this.toDate(date);
      }
    }

    toDate(dateStruct: NgbDateStruct): Date {
      return dateStruct ? new Date(dateStruct.year, dateStruct.month - 1, dateStruct.day) : null;
    }

    toMoment(dateStruct: NgbDateStruct): moment.Moment {
      return moment(this.toDate(dateStruct));
    }

    isHovered = (date: NgbDateStruct) => this.from && !this.to && this.hoveredDate
      && this.toMoment(date).isAfter(this.from) && this.toMoment(date).isBefore(this.hoveredDate);

    isInside = (date: NgbDateStruct) => this.toMoment(date).isAfter(moment(this.from).startOf('day')) && this.toMoment(date).isBefore(moment(this.to).startOf('day'));
    isFrom = (date: NgbDateStruct) => this.toMoment(date).isSame(this.from, 'd');
    isTo = (date: NgbDateStruct) => this.toMoment(date).isSame(this.to, 'd');

}
