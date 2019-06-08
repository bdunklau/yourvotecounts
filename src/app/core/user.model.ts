export class FirebaseUserModel {
  uid: string;
  image: string;
  displayName: string;
  provider: string;
  phoneNumber: string;
  roles: Array<String>;

  constructor(){
    this.uid = ""
    this.image = "";
    this.displayName = "";
    this.provider = "";
    this.phoneNumber = "";
    this.roles = [];
  }

  isAdmin(): boolean {
    return this.roles && this.roles["admin"] != -1
  }
}
