import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { LogEntry } from './logentry'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { LogService } from '../log/log.service';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  logRef: AngularFirestoreCollection<LogEntry>;
  log: Observable<LogEntry[]>;

  constructor(private afs: AngularFirestore,
              private logService: LogService) { }

  // helpful for getting queries working:  https://www.youtube.com/watch?v=SGQGFO_zkx4&t=409s
  ngOnInit() {
    this.logRef = this.afs.collection('log', ref => ref.orderBy('date_ms', 'desc').limit(50));
    this.log = this.logRef.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as LogEntry;
        const id = a.payload.doc.id;
        var thedata = { id, ...data };
        console.log('LogComponent:ngOnInit() thedata: ', thedata);
        return thedata;
      }))
    );
  }

  logout() {
    this.logService.logout(firebase.auth().currentUser);
  }

  ngOnDestroy() {
    // we never called subscribe
  }

}
