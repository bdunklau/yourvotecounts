export class FirebaseUserModel {
  image: string;
  displayName: string;
  provider: string;
  phoneNumber: string;

  constructor(){
    this.image = "";
    this.displayName = "";
    this.provider = "";
    this.phoneNumber = "";
  }
}
