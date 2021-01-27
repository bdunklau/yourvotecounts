import { Component, OnInit, OnDestroy } from '@angular/core';
import { TagService } from '../tag.service';
import { Tag } from '../tag.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash'


/**
 * ng g c tag/tag-list --module app
 * 
 * see comment-list.component.ts
 */
@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})
export class TagListComponent implements OnInit {

    tags?: Tag[]
    subscription: Subscription
    deleting = false


    constructor(private tagService: TagService) { }

    async ngOnInit() {
        
        this.subscription = this.tagService.getTags().pipe(
          map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as Tag;
              /**
               * You CAN do this to get the doc id, but we have the commentId attribute on the document already which 
               * equals the doc id
               */
              // const id = a.payload.doc['id'];
              // var returnThis = { id, ...data };
              return data //returnThis;
            });
          })
        )
          .subscribe(objs => {
            this.tags = _.map(objs, obj => {
              let tm = obj as unknown;
              return tm as Tag;
            })
          });


    }


    ngOnDestroy() {
        if(this.subscription) this.subscription.unsubscribe()
    }


    deleteTag(tag: Tag) {
        tag.deleting = true
    }

    confirmDelete(tag: Tag) {
        this.tagService.delete(tag)
    }

}
