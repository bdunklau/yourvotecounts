import { FirebaseUserModel } from './user.model'

describe('FirebaseUserModel', () => {

  it('should be an Admin 1', () => {
    console.log('FirebaseUserModel: begin: 1')
    let u = new FirebaseUserModel()
    u.roles = ["admin"]
    expect(u.hasRole('admin')).toBeTruthy();
    console.log('FirebaseUserModel: end: 1')
  });

  it('should be an Admin 2', () => {
    console.log('FirebaseUserModel: begin: 2')
    let u = new FirebaseUserModel()
    u.roles = ["role1", "admin"]
    expect(u.hasRole('admin')).toBeTruthy();
    console.log('FirebaseUserModel: end: 2')
  });

  it('should not be an Admin 1', () => {
    console.log('FirebaseUserModel: begin: 3')
    let u = new FirebaseUserModel()
    u.roles = ["role1"]
    expect(u.hasRole('admin')).toBeFalsy();
    console.log('FirebaseUserModel: end: 3')
  });

  it('should not be an Admin 2', () => {
    console.log('FirebaseUserModel: begin: 4')
    let u = new FirebaseUserModel()
    expect(u.hasRole('admin')).toBeFalsy();
    console.log('FirebaseUserModel: end: 4')
  });
})
