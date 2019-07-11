import { browser, by, element, Key } from 'protractor';
import * as protractor from 'protractor';
import { TestSupport } from './test-support.po';
import * as request from 'request'; // https://stackoverflow.com/questions/45182309/making-an-api-call-while-running-protractor-tests


export class Api {

    constructor(private testSupport: TestSupport) { }

    async getUserJson(phoneNumber: string) {

      var url = 'https://us-central1-yourvotecounts-bd737.cloudfunctions.net/getUser?phoneNumber='+phoneNumber+'&auth_key='+process.env.YOURVOTECOUNTS_AUTH_KEY;

      // browser.waitForAngularEnabled(false);
      // var prom = await browser.get(url);// as Promise<any>;
      // console.log('prom = ', prom);

      // var json = prom.then(xx => {
      //   console.log('xx = ', xx);
      // });
      // console.log('url = ', url);
      // console.log('json = ', json);
      // return json;


      request(url, function (error, response, body) {
          console.log('error:', error); // Print the error if one occurred
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the HTML for the Google homepage.
          // done(); //informs runner that the asynchronous code has finished
      });
    }

}
