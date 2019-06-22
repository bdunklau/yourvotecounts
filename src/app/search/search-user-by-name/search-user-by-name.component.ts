import { Component, OnInit, EventEmitter/*, Input*/, Output } from '@angular/core';
import { Observable, /*of, Subject, Subscription*/ } from 'rxjs';
import { UserService } from '../../user/user.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError  } from 'rxjs/operators';

@Component({
  selector: 'app-search-user-by-name',
  templateUrl: './search-user-by-name.component.html',
  styleUrls: ['./search-user-by-name.component.css']
})
export class SearchUserByNameComponent implements OnInit {

  @Output() enteredName = new EventEmitter<string>();
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
            return searchText.length < 2 ? [] : this.userService.searchByName(searchText);
          } )
          // catchError(new ErrorInfo().parseObservableResponseError)
      );
  }

  /**
   * Used to format the result data from the lookup into the
   * display and list values. Maps `{displayName: "Some User", phoneNumber:"+15555554444" }` into a string
  */
  resultFormatNameListValue(value: any) {
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
    this.enteredName.emit($event.item.displayName);
  }

}
