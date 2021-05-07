import { Component, OnInit } from '@angular/core';


/**
 * ng g c tag/tags --module app
 */
@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}
