import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../settings/settings.service';
import { Settings } from '../../../settings/settings.model'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { MessageService } from '../../../core/message.service';


/**
 * ng g c admin/vm/vm-health --module app
 */
@Component({
  selector: 'app-vm-health',
  templateUrl: './vm-health.component.html',
  styleUrls: ['./vm-health.component.css']
})
export class VmHealthComponent implements OnInit {

    
    vmRunning?: boolean


    /**
     * Ping the virtual machine to confirm it's up
     */
    constructor(private messageService: MessageService,) { }

    async ngOnInit() {
        let handleVmStateEvent = function(value) {
            this.vmRunning = value
        }.bind(this)


        this.messageService.listenForVmState().subscribe({
            next:  handleVmStateEvent,
            error: function(value) {
            },
            complete: function() {
            }            
        })
    }


}
