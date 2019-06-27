import { Component, OnInit, EventEmitter/*, Input*/, Output } from '@angular/core';
import { Observable, /*of, Subject, Subscription*/ } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError  } from 'rxjs/operators';
import { UserService } from '../../user/user.service';
import { FirebaseUserModel } from '../../user/user.model';

@Component({
  selector: 'app-search-user-by-phone',
  templateUrl: './search-user-by-phone.component.html',
  styleUrls: ['./search-user-by-phone.component.css']
})
export class SearchUserByPhoneComponent implements OnInit {

  @Output() selectedUser = new EventEmitter<FirebaseUserModel>();
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
              if(!searchText.startsWith('+1')) searchText = '+1'+searchText;
              return this.userService.searchByPhone(searchText, 10);
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
    this.selectedUser.emit($event.item);
  }

  checkEmpty() {
    console.log('checkEmpty');
    this.selectedUser.emit(null);
  }

}
