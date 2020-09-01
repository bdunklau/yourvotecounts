import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { /*Subject, Observable,*/ Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: 'app-view-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.css']
})
export class ViewVideoComponent implements OnInit {

    //composition:any
    //url: string
    private routeSubscription: Subscription;
    compositionSid: string
    storageName: string
    videoUrl: string

    constructor(private afStorage: AngularFireStorage,
      private route: ActivatedRoute) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
      if(this.routeSubscription) this.routeSubscription.unsubscribe();
    }


    async ngAfterViewInit() {
      this.routeSubscription = this.route.params.subscribe(async params => {
          this.compositionSid = params['compositionSid']; // (+) converts string 'id' to a number
          this.storageName = this.compositionSid+"-output.mp4"
          // In a real app: dispatch action to load the details here.

          
          await this.afStorage.storage
               .refFromURL('gs://yourvotecounts-bd737.appspot.com/'+this.storageName)
               .getDownloadURL().then(url => {
                   console.log("this.videoUrl = ", url)
                   this.videoUrl = url;
                   //this.isUploading = false;
                })
    });
    }

}
