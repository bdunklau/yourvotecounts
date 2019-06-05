import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { LogEntry } from './logentry'

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  public log: AngularFireList<any[]>;

  constructor(private db: AngularFireDatabase) {}


  // maybe this:   https://dev.to/crazedvic/query--update-firestore-documents-in-angular-7-5fhg
  ngOnInit() {
    this.db.collection('log').valueChanges().subscribe(console.log);
  }

}
