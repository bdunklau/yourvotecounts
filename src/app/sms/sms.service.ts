import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SmsService {

  constructor() { }

  sendSms(args: {number: string, message: string}) {
    
  }
}
