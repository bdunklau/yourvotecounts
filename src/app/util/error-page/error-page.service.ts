import { Injectable } from '@angular/core';



/**
 * Just a simple service that allows guards to pass error messages to the /error-page
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorPageService {

  errorMsg: string
  errorTitle: string

  constructor() { }
}
