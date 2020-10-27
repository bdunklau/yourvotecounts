import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


/**
 * ng g c ad/banner-ad --module app
 */
@Component({
  selector: 'app-banner-ad',
  templateUrl: './banner-ad.component.html',
  styleUrls: ['./banner-ad.component.css']
})
export class BannerAdComponent implements OnInit {

    constructor(
      private router: Router,) { }

    ngOnInit(): void {
    }


    donate() {
        if(window)  window.open('https://www.winred.com', '_blank');
    }

}
