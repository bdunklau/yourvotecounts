import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference } from '@angular/fire/firestore';
import { LogEntry } from './logentry'
import { Subject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { LogService } from '../log/log.service';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  log$ = new Subject<any>();
  log: LogEntry[];
  subscription: Subscription;
  level: string;
  phoneVal: string;
  nameVal: string;
  dates: any;

  constructor(private afs: AngularFirestore,
              private logService: LogService) { }

  // helpful for getting queries working:  https://www.youtube.com/watch?v=SGQGFO_zkx4&t=409s
  ngOnInit() {

    // aka Dynamic Query
    this.subscription = this.log$.pipe(
      switchMap(args => {
          var level = args.level ? args.level : this.level;
          var phoneVal = args.phoneVal ? args.phoneVal : this.phoneVal;
          var nameVal = args.nameVal ? args.nameVal : this.nameVal;
          var dates = args.dates ? args.dates : this.dates;
          var limit = 50;
          var collectionRef;
          return this.afs
              .collection('log_'+level,
                  ref => {
                    // WHICH QUERY? DEPENDS ON THE ARGS PASSED IN
                    if(phoneVal) {
                      console.log('switchMap:  phoneVal = ', phoneVal);
                      collectionRef = ref.where('phoneNumber', '==', phoneVal);
                    }
                    if(nameVal) {
                      console.log('switchMap:  nameVal = ', nameVal);
                      collectionRef = (collectionRef ? collectionRef : ref).where('displayName', '==', nameVal);
                    }
                    if(dates && dates != NaN) {
                      console.log('switchMap:  dates.date1 = ', dates.date1)
                      collectionRef = (collectionRef ? collectionRef : ref).orderBy('date_ms', 'desc').startAt(dates.date2).endAt(dates.date1);
                    }
                    else {
                      collectionRef = (collectionRef ? collectionRef : ref).orderBy('date_ms', 'desc');
                    }
                    collectionRef = (collectionRef ? collectionRef : ref).limit(limit);
                    return collectionRef;
              })
              .valueChanges()
        }
      )
    ).subscribe((something) => {
      let xx:LogEntry[] = something as LogEntry[];
      //console.log('xx = ', xx)
      this.log = xx;
    });

    // initial log level is set in choose-level.component.ts : ngOnInit()
  }

  ngOnDestroy() {
    // console.log('LogComponent: unsubscribe');
    this.subscription.unsubscribe(); // not convinced this is right - never a call to subscribe
  }

  // see choose-level.component.ts : ngOnInit() - that methods sets an initial log level which gets picked up here
  // see  <app-choose-level (level)="onLevelChosen($event)"></app-choose-level>
  // in log.component.html
  onLevelChosen(level: string) {
    // console.log('onLevelChosen: level = ', level);
    this.level = level;
    this.log$.next({level: level});
  }

  onPhoneEntered(phoneVal: string) {
    // console.log('onPhoneEntered: phoneVal = ', phoneVal);
    this.phoneVal = phoneVal;
    this.log$.next({phoneVal: phoneVal});
  }

  onNameEntered(nameVal: string) {
    // console.log('onNameEntered: nameVal = ', nameVal);
    this.nameVal = nameVal;
    this.log$.next({nameVal: nameVal});
  }

  onDateEntered(dates) {
    console.log('onDateEntered: dates = ', dates);
    this.dates = dates;
    this.log$.next(dates);
  }

  public onDateRangeSelection(range: { from: Date, to: Date }) {
    this.dates = {date1: range.from.getTime(), date2: range.to.getTime()};
    this.log$.next(this.dates);
  }

}
