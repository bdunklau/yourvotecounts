import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { LogEntry } from './logentry'
import { Subject, Observable, Subscription } from 'rxjs';
// import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { LogService } from '../log/log.service';
import { switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { FirebaseUserModel } from '../user/user.model';
import { PaginationService } from '../pagination/pagination.service';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  log$ = new Subject<any>();
  log: LogEntry[];
  subscription: Subscription;
  level: string = 'debug';
  phoneVal: string;
  nameVal: string;
  dates: any;
  reverse: boolean = true;
  prepend: boolean = false;
  limit: number = 10;

  constructor(private afs: AngularFirestore,
              private logService: LogService,
              public page: PaginationService) { }

  // helpful for getting queries working:  https://www.youtube.com/watch?v=SGQGFO_zkx4&t=409s
  ngOnInit() {

    // this.page.init('log_info', 'date_ms', null, null, null, {reverse: true, prepend: false /* why false? */});

    // aka Dynamic Query
    // this.subscription = this.log$.pipe(
    //   switchMap(args => {
    //       console.log('args = ', args);
    //       var level = args.level ? args.level : this.level;
    //       var phoneVal = args.phoneVal ? args.phoneVal : this.phoneVal;
    //       var nameVal = args.nameVal ? args.nameVal : this.nameVal;
    //       var dates = args.dates ? args.dates : this.dates;
    //       var limit = 50;
    //       var collectionRef;
    //       return this.afs
    //           .collection('log_'+level,
    //               ref => {
    //                 // WHICH QUERY? DEPENDS ON THE ARGS PASSED IN
    //                 if(phoneVal) {
    //                   console.log('switchMap:  phoneVal = ', phoneVal);
    //                   collectionRef = ref.where('phoneNumber', '==', phoneVal);
    //                 }
    //                 if(nameVal) {
    //                   console.log('switchMap:  nameVal = ', nameVal);
    //                   collectionRef = (collectionRef ? collectionRef : ref).where('displayName', '==', nameVal);
    //                 }
    //                 if(dates && dates != NaN) {
    //                   console.log('switchMap:  dates.date1 = ', dates.date1)
    //                   collectionRef = (collectionRef ? collectionRef : ref).orderBy('date_ms', 'desc').startAt(dates.date2).endAt(dates.date1);
    //                 }
    //                 else {
    //                   collectionRef = (collectionRef ? collectionRef : ref).orderBy('date_ms', 'desc');
    //                 }
    //                 collectionRef = (collectionRef ? collectionRef : ref).limit(limit);
    //                 return collectionRef;
    //           })
    //           .valueChanges()
    //     }
    //   )
    // ).subscribe((something) => {
    //   let xx:LogEntry[] = something as LogEntry[];
    //   //console.log('xx = ', xx)
    //   this.log = xx;
    // });

    // initial log level is set in choose-level.component.ts : ngOnInit()
  }

  ngOnDestroy() {
    // console.log('LogComponent: unsubscribe');
    if(this.subscription) this.subscription.unsubscribe(); // not convinced this is right - never a call to subscribe
  }


  // getCollection(level, phoneVal, nameVal, dates): AngularFirestoreCollection<any> {
  //   var collectionRef;
  //   var limit = 10;
  //   this.level = level;
  //   this.phoneVal = phoneVal;
  //   this.nameVal = nameVal;
  //   this.dates = dates;
  //   this.reverse = true;
  //   this.prepend = false;
  //   return this.afs.collection('log_'+level, this.queryInitial.bind(this));
  // }


  // see choose-level.component.ts : ngOnInit() - that methods sets an initial log level which gets picked up here
  // see  <app-choose-level (level)="onLevelChosen($event)"></app-choose-level>
  // in log.component.html
  onLevelChosen(level: string) {
    console.log('onLevelChosen: level = ', level, ' this.nameVal = ',this.nameVal, ' this=', this);
    this.level = level;
    // this.log$.next({level: level});
    // const col:AngularFirestoreCollection<any> = this.getCollection(this.level, this.phoneVal, this.nameVal, this.dates);
    this.page.init('log_'+this.level, this.queryInitial.bind(this), this.querySubsequent.bind(this), {reverse: true, prepend: false /* why false? */});
  }

  onUserSelectedByPhone(user: FirebaseUserModel) {
    // console.log('onUserSelectedByPhone: phoneVal = ', phoneVal);
    if(!user) {
      delete this.phoneVal;
    }
    else {
      this.phoneVal = user.phoneNumber;
      // this.log$.next({phoneVal: this.phoneVal});
      // const col:AngularFirestoreCollection<any> = this.getCollection(this.level, this.phoneVal, this.nameVal, this.dates);
      this.page.init('log_'+this.level, this.queryInitial.bind(this), this.querySubsequent.bind(this), {reverse: true, prepend: false /* why false? */});
    }
  }

  onUserSelectedByName(user: FirebaseUserModel) {
    // console.log('onUserSelectedByName: nameVal = ', nameVal);
    if(!user) {
      console.log('onUserSelectedByName: delete this.nameVal ******************');
      delete this.nameVal;
    }
    else {
      this.nameVal = user.displayName;
      console.log('onUserSelectedByName: this.level = ', this.level, ' this.nameVal = ',this.nameVal, ' this=', this);
      // this.log$.next({nameVal: this.nameVal});
      // const col:AngularFirestoreCollection<any> = this.getCollection(this.level, this.phoneVal, this.nameVal, this.dates);
      this.page.init('log_'+this.level, this.queryInitial.bind(this), this.querySubsequent.bind(this), {reverse: true, prepend: false /* why false? */});
    }
  }

  onDateEntered(dates) {
    console.log('onDateEntered: dates = ', dates);
    this.dates = dates;
    // this.log$.next(dates);
    // const col:AngularFirestoreCollection<any> = this.getCollection(this.level, this.phoneVal, this.nameVal, this.dates);
    this.page.init('log_'+this.level, this.queryInitial.bind(this), this.querySubsequent.bind(this), {reverse: true, prepend: false /* why false? */});
  }

  public onDateRangeSelection(range: { from: Date, to: Date }) {
    // Add 1 day so that the results will include the 'to' date, since times are midnight
    if(range && range.to && range.from) {
      var plus1Day = moment(range.to).add(1, 'days').toDate()
      this.dates = {date1: range.from.getTime(), date2: plus1Day.getTime()};
      // this.log$.next(this.dates);
      console.log('onDateRangeSelection: this.level = ', this.level, ' this.dates = ', this.dates);
      // const col:AngularFirestoreCollection<any> = this.getCollection(this.level, this.phoneVal, this.nameVal, this.dates);
      this.page.init('log_'+this.level, this.queryInitial.bind(this), this.querySubsequent.bind(this), {reverse: true, prepend: false /* why false? */});
    }
  }


  querySubsequent(ref: CollectionReference): Query {

    const cursor = this.page.getCursor();
    return this.queryInitial(ref).startAfter(cursor);
  }


  queryInitialX(ref: CollectionReference): Query {

    return ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc').limit(this.limit);
  }


  // use instead of queryInitialX()
  queryInitial(ref/*: CollectionReference*/): Query {
    var fname = 'queryInitial';
    // var collectionRef;
    console.log(fname+':  phoneVal = ', this.phoneVal);
    console.log(fname+':  nameVal = ', this.nameVal);
    console.log(fname+':  dates = ', this.dates);
    console.log(fname+':  reverse = ', this.reverse);
    console.log(fname+':  limit = ', this.limit);

    if(this.phoneVal) {
      // collectionRef = ref.where('phoneNumber', '==', this.phoneVal);
      ref = ref.where('phoneNumber', '==', this.phoneVal);
    }
    if(this.nameVal) {
      // collectionRef = (collectionRef ? collectionRef : ref).where('displayName', '==', this.nameVal);
      ref = ref.where('displayName', '==', this.nameVal);
    }
    if(this.dates && this.dates != NaN) {
      // collectionRef = (collectionRef ? collectionRef : ref).orderBy('date_ms', this.reverse ? 'desc' : 'asc').startAt(this.dates.date2).endAt(this.dates.date1);
      ref = ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc').startAt(this.dates.date2).endAt(this.dates.date1);
    }
    else {
      // collectionRef = (collectionRef ? collectionRef : ref).orderBy('date_ms', this.reverse ? 'desc' : 'asc');
      ref = ref.orderBy('date_ms', this.reverse ? 'desc' : 'asc');
    }
    // collectionRef = (collectionRef ? collectionRef : ref).limit(this.limit);
    ref = ref.limit(this.limit);
    return ref;
  }

  // got this from   https://angularfirebase.com/lessons/infinite-scroll-firestore-angular/
  scrollHandler(e) {
    console.log(e);
    if(e === 'bottom') {
      this.page.more();
    }
  }

}
