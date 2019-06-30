import * as _ from 'lodash';

export class FirebaseUserModel {
  uid: string;
  image: string;
  displayName: string;
  displayName_lower: string;
  provider: string;
  phoneNumber: string;
  roles: Array<String>;
  photoURL: string;
  date_ms: number;

  constructor(){
    this.uid = ""
    this.image = "";
    this.displayName = "";
    this.displayName_lower = "";
    this.provider = "";
    this.phoneNumber = "";
    this.roles = [];
    this.photoURL = "";
  }

  populate(obj) {
    this.uid = obj.uid;
    this.image = obj.image;
    this.displayName = obj.displayName;
    this.displayName_lower = obj.displayName_lower;
    this.provider = obj.provider;
    this.phoneNumber = obj.phoneNumber;
    this.roles = obj.roles;
    this.photoURL = obj.photoURL;
  }

  hasRole(role: string): boolean {
    var idx = _.findIndex(this.roles, function(o) { return o == role; });
    return idx != -1
  }
}
