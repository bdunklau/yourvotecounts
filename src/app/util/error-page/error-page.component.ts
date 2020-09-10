import { Component, OnInit } from '@angular/core'
import { ErrorPageService } from './error-page.service'

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {

  errorMsg: string = 'Houston, we have a problem'

  constructor(
    private errorPageService: ErrorPageService) { }

  ngOnInit(): void {
    if(this.errorPageService.errorMsg)
      this.errorMsg = this.errorPageService.errorMsg
  }

}
