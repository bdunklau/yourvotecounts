import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import { startWith, map } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { TagService } from '../tag.service';
import { Tag } from '../tag.model';
import * as _ from 'lodash'
import { RoomObj } from 'src/app/room/room-obj.model';
import { RoomService } from 'src/app/room/room.service';


@Component({
  selector: 'app-tag-editor',
  templateUrl: './tag-editor.component.html',
  styleUrls: ['./tag-editor.component.css']
})
export class TagEditorComponent implements OnInit {


    visible = true;
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    tagsCtrl = new FormControl();
    filteredTags: Observable<string[]>;
    // filteredTags: Observable<Tag[]>;
    // tagNames: string[] = [];
    // allTags: string[] = [] // = ['India','USA', 'UK', 'Australia', 'Belgium', 'New Zealand','Canada','Philippines','Russia'];
    allTags: Tag[] = []
    subscription: Subscription
    editingTagNames = false     
    @Input() inputIsHost: boolean   
    @Input() inputRoomToTagEditor: RoomObj // passed in from view-video.component.html


    @ViewChild('tagInput') tagInput: ElementRef;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(private tagService: TagService,
                private roomService: RoomService) {
      this.filteredTags = this.tagsCtrl.valueChanges.pipe(
          startWith(null),
          map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice().map(t => t.name)));
    }


    ngOnInit(): void {
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
            this.allTags = _.map(objs, obj => {
              let tm = obj as unknown;
              return tm as Tag;
            })
            
            // this.filteredTags = this.tagsCtrl.valueChanges.pipe(
            //   startWith(null),
            //   map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));


          });

        if(!this.inputRoomToTagEditor.tags) this.inputRoomToTagEditor.tags = []
    }


    ngOnDestroy() {
        if(this.subscription) this.subscription.unsubscribe()
    }



    add(event: MatChipInputEvent): void {
      /**
       * This works but it lets you enter *anything* - and I don't want that.  I only want the user to be able to enter
       * one of the prefined tags
       */

      // const input = event.input;
      // const value = event.value;

      // let foundTagName = _.find(this.allTags, aTag => { return aTag.name == value})
      // console.log('add(): foundTagName = ', foundTagName)

      // // Add our tag
      // if ((value || '').trim()) {
      //   this.tagNames.push(value.trim());
      // }

      // // Reset the input value
      // if (input) {
      //   input.value = '';
      // }

      // this.tagsCtrl.setValue(null);
    }

    async remove(tagName: string) {
      console.log('remove(): tag = ',tagName)
      // console.log('remove(): this.tagNames = ',this.tagNames)
      // const index = this.tagNames.indexOf(tagName);

      // if (index >= 0) {
        await this.roomService.removeTag(this.inputRoomToTagEditor, tagName)
        console.log('remove(): this.inputRoomToTagEditor.tags = ',this.inputRoomToTagEditor.tags)
        // this.tagNames.splice(index, 1);
      // }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
      // console.log('selected(): this.tagNames = ', this.tagNames)
      // this.tagNames.push(event.option.viewValue);
      this.tagInput.nativeElement.value = '';
      this.tagsCtrl.setValue(null);
      console.log('selected(): this.inputRoomToTagEditor.tags = ', this.inputRoomToTagEditor.tags)
      this.roomService.addTag(this.inputRoomToTagEditor, event.option.viewValue)
    }

    /**
     * fires on every keystroke
     */
    private _filter(value: string): string[] {
      const filterValue = value.toLowerCase();
      // console.log('_filter(): this.allTags = ', this.allTags)
      return this.allTags.filter(tag => tag.name.toLowerCase().indexOf(filterValue) === 0).map(tag => tag.name);
    }


    saveTags() {
        // tags are saved one at a time in selected()
        this.editingTagNames = false
    }

}
