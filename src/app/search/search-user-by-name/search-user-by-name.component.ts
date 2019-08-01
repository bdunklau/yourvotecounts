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
  @Input() clearOnSelected: string;
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
    var retVal = value
    if(value.displayName)
      retVal = value.displayName;
    return retVal;
  }

  // NOTE this:  (selectItem)="itemSelected($event)"
  // in search-user-by-name.component.html
  itemSelected($event) {
    let user = new FirebaseUserModel();
    user.populate($event.item);
    this.selectedUser.emit(user);
  }

  // don't remember what this is supposed to be doing
  checkEmpty($event) {
    console.log('checkEmpty: $event = ', $event);
    console.log('checkEmpty: this.nameVal = ', this.nameVal, ' empty string: ', (this.nameVal === ''));
    if(this.nameVal === '') delete this.nameVal;

    // 7/27/19 - took this out because I want the name left in the name field when searching logs
    // this.nameVal = '';
    // this.selectedUser.emit(null);
  }

}
