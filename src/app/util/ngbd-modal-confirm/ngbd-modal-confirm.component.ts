import { Component, OnInit } from '@angular/core';
import { NgbActiveModal/*, NgbModal*/ } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-ngbd-modal-confirm',
  templateUrl: './ngbd-modal-confirm.component.html',
  styleUrls: ['./ngbd-modal-confirm.component.css']
})
export class NgbdModalConfirmComponent implements OnInit {

  // If these had been objects, we would have needed @Input in front of each
  title: string;
  question: string;
  thing: string;
  warning_you: string;
  really_warning_you: string;

  // constructor(public modal: NgbActiveModal) {}
  constructor(public modal: NgbActiveModal) {}

  ngOnInit() {
  }

}
