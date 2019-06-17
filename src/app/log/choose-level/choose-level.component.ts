import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-choose-level',
  templateUrl: './choose-level.component.html',
  styleUrls: ['./choose-level.component.css']
})
export class ChooseLevelComponent implements OnInit {

  levels: [string];
  // level_number: number;
  @Output() level_number = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  chooseLevel(level_number) {
    // this.level_number = level_number;
    console.log('level_number: ', level_number)

    this.level_number.emit(level_number);
  }

}
