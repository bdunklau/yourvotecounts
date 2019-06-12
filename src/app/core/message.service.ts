import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FirebaseUserModel } from '../user/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  // private myMessage = new Subject<string>();
  private user = new Subject<FirebaseUserModel>();

  constructor() { }

  // getMessage(): Observable<string> {
  //    return this.myMessage.asObservable();
  // }
  //
  // updateMessage(message: string) {
  //   this.myMessage.next(message);
  // }

  getUser(): Observable<FirebaseUserModel> {
     return this.user.asObservable();
  }

  updateUser(user: FirebaseUserModel) {
    this.user.next(user);
  }

}
