import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { TagService } from '../tag/tag.service';
import { Tag } from '../tag/tag.model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash'
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';


/**
 * ng g c trending --module app
 * 
 * Component that shows what the most popular hashtags are
 */
@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})
export class TrendingComponent implements OnInit {

    mostPopular: Tag[]
    subscription: Subscription
    collapsed = true

    constructor(private tagService: TagService,
      private router: Router,
      @Inject(PLATFORM_ID) private platformId,) { }



    async ngOnInit() {
        if(isPlatformBrowser(this.platformId)) {
          
          this.subscription = this.tagService.getMostPopular().pipe(
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
              this.mostPopular = _.map(objs, obj => {
                let tm = obj as unknown;
                return tm as Tag;
              })
            });
        }
    }


    ngOnDestroy() {
        if(this.subscription) this.subscription.unsubscribe()
    }


    listTaggedVideos(tag: Tag) {
        this.router.navigate(['videos', tag.name], 
        // {
        //     skipLocationChange: true,
        //     queryParamsHandling: 'merge' //== if you need to keep queryParams
        // }
        )
    }

}
