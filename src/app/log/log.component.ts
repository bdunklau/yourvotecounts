import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { LogEntry } from './logentry'
import { Observable } from 'rxjs/Observable'

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  logRef: AngularFirestoreCollection<LogEntry>;
  log: Observable<LogEntry[]>;

  constructor(private afs: AngularFirestore) { }

  // helpful for getting queries working:  https://www.youtube.com/watch?v=SGQGFO_zkx4&t=409s
  ngOnInit() {
    this.logRef = this.afs.collection('log', ref => ref.orderBy('date_ms').limit(10))
    this.log = this.logRef.valueChanges()
  }
  
  ngOnDestroy() {
    // this.logRef.unsubscribe(); // we never called subscribe
  }

}
