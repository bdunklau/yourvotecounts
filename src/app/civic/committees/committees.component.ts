import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { Committee } from '../officials/view-official/view-official.component';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { CommitteeService } from './committee.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash'
import { timeStamp } from 'console';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/core/message.service';



/**
 *  ng g c civic/committees --module=app
 */
@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.css']
})
export class CommitteesComponent implements OnInit {


    committees: Committee[]
    subscription: Subscription
    selectedCommittee: Committee
    ocdIdValue: string


    constructor(private route: ActivatedRoute,
      private committeeService: CommitteeService,
      private messageService: MessageService,
      @Inject(PLATFORM_ID) private platformId,) { }

    ngOnInit(): void {

        if(isPlatformBrowser(this.platformId)) {
            let setCommittee = function(committee) { this.selectedCommittee = committee }.bind(this)

            this.messageService.listenForCommitteeSelection().subscribe({
                next: setCommittee,
                error: () => {}, 
                complete: () => {}
            })

        //     this.committees = [];
            
        //     this.subscription = this.committeeService.getCommittees().pipe(
        //       map(actions => {
        //         return actions.map(a => {
        //           const data = a.payload.doc.data() as Committee;
        //           data.id = a.payload.doc['id'];
        //           // var returnThis = { id, ...data };
        //           return data //returnThis;
        //         });
        //       })
        //     )
        //     .subscribe(objs => {
        //         this.committees = _.map(objs, obj => {
        //           let tm = obj as unknown;
        //           return tm as Committee;
        //         })                
          
        //         let committeeId = this.route.snapshot.params.committeeId
        //         if(committeeId) {
        //             this.selectedCommittee = _.find(this.committees, {id: committeeId})
        //         }

        //     });

        }

    }


    ngOnDestroy() {
        // if(this.subscription) this.subscription.unsubscribe()
    }


    async onSubmit(/* not needed    form: NgForm*/) {
        await this.committeeService.addOfficial({ocdId: this.ocdIdValue, committee: this.selectedCommittee});
    }

}
