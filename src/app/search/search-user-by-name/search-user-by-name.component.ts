import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Observable, /*of, Subject, Subscription*/ } from 'rxjs';
import { UserService } from '../../user/user.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError  } from 'rxjs/operators';
import { FirebaseUserModel } from '../../user/user.model';
import { Friend } from 'src/app/friend/friend.model';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-search-user-by-name',
  templateUrl: './search-user-by-name.component.html',
  styleUrls: ['./search-user-by-name.component.css']
})
export class SearchUserByNameComponent implements OnInit {

  @Output() selectedUser = new EventEmitter<FirebaseUserModel>();
  @Output() selectedFriend = new EventEmitter<Friend>();
  @Input() clearOnSelected: string; // doesn't appear to be used
  @Input() friendsOnly: boolean = false
  nameVal: string;

  @Input() formGroup_AAA: FormGroup
  @Input() controllName_AAA: string
  @Input() groupIdx_AAA: number
  @Input() formArray_AAA: FormArray
  @Input() arrayName_AAA: string

  constructor(private userService: UserService) {   }

  ngOnInit() {
      if(this.formGroup_AAA) { // just debugging
            console.log('SearchUserByNameComponent: this.formGroup_AAA = ', this.formGroup_AAA)
            console.log('SearchUserByNameComponent: this.controllName_AAA = ', this.controllName_AAA)
            console.log('SearchUserByNameComponent: this.groupIdx_AAA = ', this.groupIdx_AAA)
            console.log('SearchUserByNameComponent: this.formArray_AAA = ', this.formArray_AAA)
            console.log('SearchUserByNameComponent: check formControl = ', this.formArray_AAA.controls[this.groupIdx_AAA].get(this.controllName_AAA)) // check console - I think we finally got it
      }
  }

  
  isInvalid() {
      return this.formArray_AAA  // assume valid if this.formArray_AAA is not present
            && this.formArray_AAA.controls[this.groupIdx_AAA].get('displayName') 
            && this.formArray_AAA.controls[this.groupIdx_AAA].get('displayName').invalid 
            && (this.formArray_AAA.controls[this.groupIdx_AAA].get('displayName').dirty || this.formArray_AAA.controls[this.groupIdx_AAA].get('displayName').touched)
  }


  // got code from here:  https://www.youtube.com/watch?v=eQuVbyBGhHA
  searchName = (text$: Observable<string>) => {
      if(this.friendsOnly) {
          console.log('query who:  just friends')
          return text$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              switchMap( /*async*/ searchText => {
                return searchText.length < 1 ? [] : this.userService.searchFriends(/*currUser,*/ searchText, 10);
              } )
              // catchError(new ErrorInfo().parseObservableResponseError)
          );
      }
      else {
          return text$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              switchMap( searchText => {
                return searchText.length < 1 ? [] : this.userService.searchByName(searchText, 10);
              } )
              // catchError(new ErrorInfo().parseObservableResponseError)
          );
      }

  }

  /**
   * Used to format the result data from the lookup into the
   * display and list values. Maps `{displayName: "Some User", phoneNumber:"+15555554444" }` into a string
  */
  resultFormatNameListValue(value: any) {
    // console.log('resultFormatNameListValue: value = ', value);
    if(value.displayName2)
        return value.displayName2
    else if(value.displayName) {
        return value.displayName;
    } else return value
  }

  /**
  * This is what gets called when you make a selection and set the value of the name field
  */
  inputFormatNameListValue(value: any)   {
      console.log('inputFormatNameListValue: value = ', value);
      if(value.displayName2) {
          console.log('inputFormatNameListValue: return value.displayName2 = ', value.displayName2);
          return value.displayName2
      } else if(value.displayName) {
          console.log('inputFormatNameListValue: return value.displayName = ', value.displayName);
          return value.displayName
      } else {
          console.log('inputFormatNameListValue: return value = ', value);
          return value
      }
  }

  // NOTE this:  (selectItem)="itemSelected($event)"
  // in search-user-by-name.component.html
  itemSelected($event) {
      if(this.friendsOnly) {
          let friend = $event.item as Friend
          console.log('friend? $event.item as Friend = ', friend)
          // invitation-form.component.html and .ts
          this.selectedFriend.emit(friend)
      }
      else {
          let user = new FirebaseUserModel();
          user.populate($event.item);
          this.selectedUser.emit(user);
          
      }
  }

  
  // makes sure we can actually clear out the name search field.  Otherwise, whatever we typed in there cannot be erased
  checkEmpty($event) {
    console.log('checkEmpty: $event = ', $event);
    console.log('checkEmpty: this.nameVal = ', this.nameVal, ' empty string: ', (this.nameVal === ''));
    if(this.nameVal === '') delete this.nameVal;

    // 7/27/19 - took this out because I want the name left in the name field when searching logs
    // this.nameVal = '';
    // this.selectedUser.emit(null);
  }

}
