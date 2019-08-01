import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-log-by-level',
  templateUrl: './search-log-by-level.component.html',
  styleUrls: ['./search-log-by-level.component.css']
})
export class SearchLogByLevelComponent implements OnInit {

  @Output() level = new EventEmitter<string>();
  levelValue: string = 'level';

  constructor() { }

  ngOnInit() {
    // initializes the /log screen to show the info view
    // see log.component.ts : onLevelChosen()
    // see log.component.html : onLevelChosen attribute

    // We COULD do this, but instead let's make the user choose a log level to get the first batch of log entries
    // this.chooseLevel('info')
  }

  chooseLevel(level) {
    this.levelValue = level;
    this.level.emit(level);
  }

}
