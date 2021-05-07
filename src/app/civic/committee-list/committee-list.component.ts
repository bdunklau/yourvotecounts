import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Committee } from '../officials/view-official/view-official.component';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CommitteeService } from '../committees/committee.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash'
import { MessageService } from 'src/app/core/message.service';


/**
 * ng g c civic/committee-list ==module=app
 */
@Component({
  selector: 'app-committee-list',
  templateUrl: './committee-list.component.html',
  styleUrls: ['./committee-list.component.css']
})
export class CommitteeListComponent implements OnInit {

    committees: Committee[]
    subscription: Subscription
    // selectedCommittee: Committee


    constructor(private route: ActivatedRoute,
      private committeeService: CommitteeService,
      private messageService: MessageService,
      @Inject(PLATFORM_ID) private platformId) { }

    ngOnInit(): void {

        if(isPlatformBrowser(this.platformId)) {
            this.committees = [];
            
            this.subscription = this.committeeService.getCommittees().pipe(
              map(actions => {
                return actions.map(a => {
                  const data = a.payload.doc.data() as Committee;
                  data.id = a.payload.doc['id'];
                  // var returnThis = { id, ...data };
                  return data //returnThis;
                });
              })
            )
            .subscribe(objs => {
                this.committees = _.map(objs, obj => {
                  let tm = obj as unknown;
                  return tm as Committee;
                })                
          
                
                // let committeeId = this.route.snapshot.params.committeeId
                // if(committeeId) {
                //     let selectedCommittee = _.find(this.committees, {id: committeeId})
                //     if(selectedCommittee) this.messageService.setCurrentCommittee(selectedCommittee)
                // }

            });

        }

    }


    selectCommittee(committee) {
        this.messageService.setCurrentCommittee(committee)
    }

}
