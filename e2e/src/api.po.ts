import { browser, by, element, Key } from 'protractor';
import * as protractor from 'protractor';
import * as request from 'request'; // https://stackoverflow.com/questions/45182309/making-an-api-call-while-running-protractor-tests
import { ApiUser } from './api-user.po';


export class Api {

  apis: any;
  user: ApiUser;

  constructor(apis: any) {
    this.apis = apis;
    if(apis.user) this.user = apis.user;
  }


}
