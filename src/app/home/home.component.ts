import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    userAgent: string
  
    constructor() { }

    ngOnInit() {
        // this.userAgent = navigator.userAgent
        // let elems = document.getElementsByClassName("foo")
        // _.each(elems, elem => {
        //     console.log('IS THIS WORKING .............')
        //     elem.style.color = 'green'
        //     elem.style.marginLeft = '100px'
        // })
    }


    // tempCss() {
      
    //     document.querySelector('.foo').addEventListener('click', function() {
    //       console.log('clicked 22222222');
    //       this.style.color = 'red';
    //       this.style.marginLeft = '30px'
    //       // this.style.paddingBottom='3em';
    //     });

    //     // document.getElementById('thing').style.marginLeft = '100px'
      
    // }
  

}
