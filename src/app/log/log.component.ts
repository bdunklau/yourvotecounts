import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { LogEntry } from './logentry'
import { Subject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { LogService } from '../log/log.service';
import { switchMap } from 'rxjs/operators';
import * as _ from "lodash";


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  log$ = new Subject<string>();
  log: LogEntry[];
  subscription: Subscription;

  constructor(private afs: AngularFirestore,
              private logService: LogService) { }

  // helpful for getting queries working:  https://www.youtube.com/watch?v=SGQGFO_zkx4&t=409s
  ngOnInit() {

    // aka Dynamic Query
    this.subscription = this.log$.pipe(
      switchMap(level => {
          console.log('switchMap:  level = ', level)
          return this.afs.collection('log_'+level, ref => ref.orderBy('date_ms', 'desc').limit(25)).valueChanges()
        }
      )
    ).subscribe((something) => {
      let xx:LogEntry[] = something as LogEntry[];
      console.log('xx = ', xx)
      this.log = xx;
    });

    // initial log level is set in choose-level.component.ts : ngOnInit()
  }

  ngOnDestroy() {
    console.log('LogComponent: unsubscribe');
    this.subscription.unsubscribe(); // not convinced this is right - never a call to subscribe
  }

  // see choose-level.component.ts : ngOnInit() - that methods sets an initial log level which gets picked up here
  // see  <app-choose-level (level)="onLevelChosen($event)"></app-choose-level>
  // in log.component.html
  onLevelChosen(level: string) {
    console.log('onLevelChosen: level = ', level);
    this.log$.next(level);
  }

}
