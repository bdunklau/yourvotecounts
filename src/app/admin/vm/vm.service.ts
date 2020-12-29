import { Injectable } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Settings } from '../../settings/settings.model';
import { Observable } from 'rxjs';
import { MessageService } from 'src/app/core/message.service';
import { AngularFirestore } from '@angular/fire/firestore';


/**
 * ng g s admin/vm/vm
 */
@Injectable({
  providedIn: 'root'
})
export class VmService {

    settings: Settings

    constructor(private messageService: MessageService,
      private afs: AngularFirestore) { 
        
    }


    /**
     * app.module.ts
     */
    async monitorVm() {        

        this.afs.collection('state').doc('vm_state').snapshotChanges().subscribe(obj => {
            // console.log('monitorVm():  obj = ', obj)
            // console.log('monitorVm():  obj.payload.data() = ', obj.payload.data())
            this.messageService.updateVmState(obj.payload.data()['up'])
        })

    }


}
