import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Observable, /*of, Subject, Subscription*/ } from 'rxjs';
import { UserService } from '../../user/user.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError  } from 'rxjs/operators';
import { FirebaseUserModel } from '../../user/user.model';

@Component({
  selector: 'app-search-user-by-name',
  templateUrl: './search-user-by-name.component.html',
  styleUrls: ['./search-user-by-name.component.css']
})
export class SearchUserByNameComponent implements OnInit {

  @Output() selectedUser = new EventEmitter<FirebaseUserModel>();
  @Input() clearOnSelect: string; // clear the search field when a name is selected?
  nameVal: string;

  constructor(private userService: UserService) { }

  ngOnInit() {
  }


  // got code from here:  https://www.youtube.com/watch?v=eQuVbyBGhHA
  searchName = (text$: Observable<string>) => {
      return text$.pipe(
          debounceTime(200),
          distinctUntilChanged(),
          switchMap( searchText => {
            return searchText.length < 1 ? [] : this.userService.searchByName(searchText, 10);
          } )
          // catchError(new ErrorInfo().parseObservableResponseError)
      );
  }

  /**
   * Used to format the result data from the lookup into the
   * display and list values. Maps `{displayName: "Some User", phoneNumber:"+15555554444" }` into a string
  */
  resultFormatNameListValue(value: any) {
    // console.log('resultFormatNameListValue: value = ', value);
    return value.displayName;
  }

  /**
  * This is what gets called when you make a selection and set the value of the name field
  */
  inputFormatNameListValue(value: any)   {
    console.log('inputFormatNameListValue: value = ', value, ' this = ', this); // 'this' is an ngbTypeahead, not the SearchUserByNameComponent
    var retVal = value
    if(value.displayName)
      retVal = value.displayName;
    return retVal;
    // return '';
  }

  // NOTE this:  (selectItem)="itemSelected($event)"
  // in search-user-by-name.component.html
  itemSelected($event) {
    console.log('itemSelected: $event = ', $event, ' this = ', this);
    let user = new FirebaseUserModel();
    user.populate($event.item);
    this.selectedUser.emit(user);
    if(this.clearOnSelect === 'true') {
      this.nameVal = '';
      // delete this.selectedUser;
    }
  }

  checkEmpty($event) {
    console.log('checkEmpty: $event = ', $event);
    this.selectedUser.emit(null);
  }

}
