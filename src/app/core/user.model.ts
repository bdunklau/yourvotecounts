export class FirebaseUserModel {
  image: string;
  name: string;
  provider: string;
  phoneNumber: string;

  constructor(){
    this.image = "";
    this.name = "";
    this.provider = "";
    this.phoneNumber = "";
  }
}
