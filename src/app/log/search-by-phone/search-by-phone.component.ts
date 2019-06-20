import { Component, OnInit, EventEmitter/*, Input*/, Output } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subject, Observable, of/*, Subscription*/ } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError  } from 'rxjs/operators';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-search-by-phone',
  templateUrl: './search-by-phone.component.html',
  styles: [`.form-control { width: 150px; }`]
  // styleUrls: ['./search-by-phone.component.css']
})
export class SearchByPhoneComponent implements OnInit {

  @Output() enteredPhone = new EventEmitter<string>();
  phoneVal: string;

  constructor(private userService: UserService) { }

  ngOnInit() {
  }


  // got code from here:  https://www.youtube.com/watch?v=eQuVbyBGhHA
  search = (text$: Observable<string>) => {
        //console.log('text$ = ', text$);
        return text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            switchMap( searchText => {
              if(!searchText.startsWith('+1')) searchText = '+1'+searchText
              return this.userService.searchByPhone(searchText)
            } )
            // catchError(new ErrorInfo().parseObservableResponseError)
        );
      }

  /**
   * Used to format the result data from the lookup into the
   * display and list values. Maps `{displayName: "Some User", phoneNumber:"+15555554444" }` into a string
  */
  resultFormatPhoneListValue(value: any) {
    return value.phoneNumber;
  }

  /**
  * This is what gets called when you make a selection and set the value of the phone field
  */
  inputFormatPhoneListValue(value: any)   {
    var retVal = value
    if(value.phoneNumber)
      retVal = value.phoneNumber;
    return retVal;
  }

  // NOTE this:  (selectItem)="itemSelected($event)"
  // in search-by-phone.component.html
  itemSelected($event) {
    // alert(JSON.stringify($event.item.phoneNumber));
    this.enteredPhone.emit($event.item.phoneNumber);
  }

}
