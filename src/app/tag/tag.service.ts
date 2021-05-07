import { Injectable } from '@angular/core';
import { Settings } from '../settings/settings.model';
import { SettingsService } from '../settings/settings.service';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { Tag } from './tag.model';


/**
 * ng g s tag/tag
 * 
 * see comment.service.ts
 */
@Injectable({
  providedIn: 'root'
})
export class TagService {

  settings: Settings

  constructor(
    private settingsService: SettingsService,
    private http: HttpClient,
    private afs: AngularFirestore,) { }

  
  getTags() {
      return this.afs.collection('tag', ref => ref.orderBy('name_lowerCase').limit(50)).snapshotChanges()
  }


  /*needed?  async*/ create(tag: Tag) {
      if(!tag.name.startsWith('#')) tag.name = '#'+tag.name
      /*await*/ this.afs.collection('tag').doc(tag.name).set(tag)
  }


  update(tag: Tag) {
      this.afs.collection('tag').doc(tag.name).update(tag)
  }


  delete(tag: Tag) {
      this.afs.collection('tag').doc(tag.name).delete() // have to delete tag from videos also TODO
  }


  createId() {
      return this.afs.createId()
  }


  getMostPopular() {
      return this.afs.collection('tag', ref => ref.where('count', '>', 0).orderBy('count', 'desc').limit(10)).snapshotChanges()
  }


}
