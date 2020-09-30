import { Component, OnInit, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { isPlatformServer } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request: Request,) { }

  ngOnInit() {

      // FYI this is how you get the host:port from the server
      if (isPlatformServer(this.platformId)) {
        //  console.log('this.request.headers:  ', this.request.headers['x-forwarded-host'])
      }
  }

}
