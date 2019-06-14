import * as _ from 'lodash';

export class FirebaseUserModel {
  uid: string;
  image: string;
  displayName: string;
  provider: string;
  phoneNumber: string;
  roles: Array<String>;
  photoURL: string;

  constructor(){
    this.uid = ""
    this.image = "";
    this.displayName = "";
    this.provider = "";
    this.phoneNumber = "";
    this.roles = [];
    this.photoURL = "";
  }

  hasRole(role: string): boolean {
    var idx = _.findIndex(this.roles, function(o) { return o == role; });
    return idx != -1
  }
}
