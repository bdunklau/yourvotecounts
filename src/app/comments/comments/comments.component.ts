import { Component, OnInit, Input } from '@angular/core';
import { RoomObj } from 'src/app/room/room-obj.model';



/**
 * ng g c comments/comments --module app
 */
@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

    @Input() inputRoomToComments: RoomObj

    constructor() { }

    ngOnInit() {
    }

}
