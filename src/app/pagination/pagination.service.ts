import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, Query, CollectionReference } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/take';

// got all this from   https://angularfirebase.com/lessons/infinite-scroll-firestore-angular/

// options to reproduce firestore queries consistently
interface QueryConfig {
  path: string;  // path to collection
  // field: string; // field to orderBy
  // phoneVal?: string;
  // nameVal?: string;
  // dates?: {date1: number, date2: string},
  limit?: number;
  reverse?: boolean;
  prepend?: boolean; // true if you want stuff added to the beginning of the array
}


@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  // source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data; // = new BehaviorSubject([]);
  private query: QueryConfig;


  data: [];
  done: Observable<boolean>;// = this._done.asObservable();
  loading: Observable<boolean>;// = this._loading.asObservable();
  // col: AngularFirestoreCollection<any>;
  queryFn: (ref:CollectionReference) => Query
  queryMoreFn: (ref:CollectionReference) => Query

  constructor(private afs: AngularFirestore) { }

  // initial query sets options and defines the Observable
  // init(path, field, phoneVal, nameVal, dates, opts?) {
  init(
        // col:AngularFirestoreCollection<any>,
        path: string,
        queryFn: (ref:CollectionReference) => Query,
        queryMoreFn: (ref:CollectionReference) => Query,
        opts?) {

    this.done = this._done.asObservable();
    this.loading = this._loading.asObservable();
    // this.col = col;
    this.query = {
      path,
      // field,
      // phoneVal,
      // nameVal,
      // dates,
      limit: 10,
      reverse: false,
      prepend: false,
      ...opts
    }

    this.queryFn = queryFn;
    this.queryMoreFn = queryMoreFn;

    this.mapAndUpdate(this.afs.collection(this.query.path, this.queryFn));

    this._data = new BehaviorSubject([]);
    this.data = this._data.asObservable()
          .scan((acc, val) => {
            return this.query.prepend ? val.concat(acc) : acc.concat(val);
          })
  }

  // maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {
    if(this._done.value || this._loading.value) {
      console.log('mapAndUpdate:  return early');
      return
    }

    //loading
    this._loading.next(true);

    // map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges()
      .do(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          const ret = { ...data, doc };
          // console.log('ret = ', ret);
          return ret;
        })

        // if prepending, reverse array
        values = this.query.prepend ? values.reverse() : values;

        // update source with new values, done loading
        this._data.next(values);
        this._loading.next(false);

        // no more values, mark done
        if(!values.length) {
          this._done.next(true);
        }
      })
      .take(1)
      .subscribe();
      // .subscribe((arr) => { // arr is an array of {type:"added", payload:{...QueryDocumentSnapshot...}}
      //   this.data = this._data.asObservable()
      //         .scan((acc, val) => {
      //           return this.query.prepend ? val.concat(acc) : acc.concat(val);
      //         })
      // })
  }

  getCursor() {
    const current = this._data.value;
    if(current.length) {
      console.log('getCursor():  returning something - thats good');
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    console.log('getCursor():  return null');
    return null;
  }

  // retrieves additional data from firestore
  more() {
    const cursor = this.getCursor();
    // const more = this.afs.collection(this.query.path, ref => {
    // ref is CollectionReference {_query: Query, firestore: Firestore}
    //   var ret /*Query object*/ = ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
    //             .limit(this.query.limit)
    //             .startAfter(cursor);
    //   console.log('ret = ', ret);
    //   return ret;
    // })


    // const more = this.afs.collection('log_info', ref => {
    //   // ref is CollectionReference {_query: Query, firestore: Firestore}
    //   var ret /*Query object*/ = ref.orderBy('date_ms', this.query.reverse ? 'desc' : 'asc')
    //             .limit(this.query.limit)
    //             .startAfter(cursor);
    //
    //   console.log('ref = ', ref);
    //   return ret;
    // })


    const more = this.afs.collection(this.query.path, this.queryMoreFn);

    this.mapAndUpdate(more);
  }

  // xxxx(ref: CollectionReference): Query {
  //   const cursor = this.getCursor();
  //   var ret /*Query object*/ = ref.orderBy('date_ms', this.query.reverse ? 'desc' : 'asc')
  //             .limit(this.query.limit)
  //             .startAfter(cursor);
  //
  //   console.log('xxxx:  ref = ', ref);
  //   return ret;
  // }
}
