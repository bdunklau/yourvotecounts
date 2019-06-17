import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { LogEntry } from './logentry'
import { Subject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { LogService } from '../log/log.service';
import { switchMap } from 'rxjs/operators';
import _ from "lodash";


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  // logRef: AngularFirestoreCollection<LogEntry>;
  // log: Observable<LogEntry[]>;
  // level_number: number;

  // log$ = new Subject<LogEntry[]>();
  log$ = new Subject<number>();
  log: Observable<LogEntry[]>;
  subscription: Subscription;

  constructor(private afs: AngularFirestore,
              private logService: LogService) { }

  // helpful for getting queries working:  https://www.youtube.com/watch?v=SGQGFO_zkx4&t=409s
  ngOnInit() {
    // this.level_number = 2;
    // this.logRef = this.afs.collection('log', ref => ref.where('level_number', '>=', this.level_number).orderBy('level_number').orderBy('date_ms', 'desc').limit(50));
    // console.log('this.logRef.snapshotChanges() = ', this.logRef.snapshotChanges());
    // this.log = this.logRef.snapshotChanges().pipe(
    //   map(actions => actions.map(a => {
    //     const data = a.payload.doc.data() as LogEntry;
    //     const id = a.payload.doc.id;
    //     var thedata = { id, ...data };
    //     console.log('LogComponent:ngOnInit() thedata: ', thedata);
    //     return thedata;
    //   }))
    // );



    // aka Dynamic Query
    this.subscription = this.log$.pipe(
      switchMap(level_number => {// level_number not used below.  Filtering happens in the log.component.html file
          console.log('LogComponent: switchMap: size = ', level_number);
          return this.afs.collection('log', ref => ref.where('level_number', '>=', level_number).limit(25)).valueChanges()
        }
      )
    ).subscribe((something) => {
      this.log = _.orderBy(something, 'date_ms', 'desc');
    });

    // subscribe to changes
    // this.log.subscribe(queriedItems => {
    //   console.log('queriedItems: ', queriedItems);
    // });

    this.onLevelChosen(2); // for the initial query
  }

  // sortByDateDesc(a, b) {
  //   // console.log('sortBy...  a = ', a, '  b = ', b);
  //   if (a.date_ms < b.date_ms)
  //     return 1;
  //   if (a.date_ms > b.date_ms)
  //     return -1;
  //   return 0;
  // }

  ngOnDestroy() {
    console.log('LogComponent: unsubscribe');
    this.subscription.unsubscribe(); // not convinced this is right - never a call to subscribe
  }

  onLevelChosen(level_number: number) {
    console.log('onLevelChosen(): level_number = ', level_number, '  this.log$ = ',this.log$)
    // this.level_number = level_number;
    this.log$.next(level_number);
  }

}
