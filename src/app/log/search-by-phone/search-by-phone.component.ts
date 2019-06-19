import { Component, OnInit } from '@angular/core';
import { SearchByPhoneService } from './search-by-phone/search-by-phone.service';
// import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
// import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subject, /*Observable, Subscription*/ } from 'rxjs';

const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
  'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

@Component({
  selector: 'app-search-by-phone',
  templateUrl: './search-by-phone.component.html',
  styles: [`.form-control { width: 300px; }`]
  // styleUrls: ['./search-by-phone.component.css']
})
export class SearchByPhoneComponent implements OnInit {

  phoneNumbers;
  startAt = new Subject();
  endAt = new Subject();

  constructor(private ss: SearchByPhoneService) { }

  // got code from here:  https://www.youtube.com/watch?v=eQuVbyBGhHA
  ngOnInit() {
    this.ss.getPhoneNumbers(this.startAt, this.endAt)
           .subscribe(phoneNumbers => this.phoneNumbers = phoneNumbers)
  }

  // got code from here:  https://www.youtube.com/watch?v=eQuVbyBGhHA
  search($event) {
    let q = $event.target.value
    this.startAt.next(q);
    this.endAt.next(q+"\uf8ff");
  }



    // todoCollectionRef: AngularFirestoreCollection<LogEntry>;
    // todo$: Observable<LogEntry[]>;

    // public model: any;

    // good ref:  https://weblog.west-wind.com/posts/2019/Apr/08/Using-the-ngBootStrap-TypeAhead-Control-with-Dynamic-Data
    // THIS WORKS - NOW LET'S TRY IT WITH A REAL QUERY

    // search = (text$: Observable<string>) =>
    //   text$.pipe(
    //     debounceTime(200),
    //     distinctUntilChanged(),
    //     map(term => term.length < 2 ? []
    //       : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    //   )


    // search = (text$: Observable<string>) =>
    //   text$.pipe(
    //     debounceTime(200),
    //     distinctUntilChanged(),
    //     map(term => term.length < 2 ? []
    //       : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    //   )

    // getPhoneNumbers(searchText): AngularFirestoreCollection<any> {
    //   // query log by phone number
    //   // ex:  return this.afs.collection('log', ref => ref.where(??????))
    //   var myRef = this.afs.collection('log');
    //   myRef.orderBy("phoneNumber").startAt(searchText).endAt(searchText + "\uf8ff");
    // }



}
