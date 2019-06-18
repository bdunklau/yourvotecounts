import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-choose-level',
  templateUrl: './choose-level.component.html',
  styleUrls: ['./choose-level.component.css']
})
export class ChooseLevelComponent implements OnInit {

  @Output() level = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  chooseLevel(level) {
    console.log('ChooseLevelComponent: level = ', level)
    this.level.emit(level);
  }

}
