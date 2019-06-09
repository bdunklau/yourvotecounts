import { FirebaseUserModel } from './user.model'

describe('FirebaseUserModel', () => {

  it('should be an Admin 1', () => {
    let u = new FirebaseUserModel()
    u.roles = ["admin"]
    expect(u.isAdmin()).toBeTruthy();
  });

  it('should be an Admin 2', () => {
    let u = new FirebaseUserModel()
    u.roles = ["role1", "admin"]
    expect(u.isAdmin()).toBeTruthy();
  });

  it('should not be an Admin 1', () => {
    let u = new FirebaseUserModel()
    u.roles = ["role1"]
    expect(u.isAdmin()).toBeFalsy();
  });

  it('should not be an Admin 2', () => {
    let u = new FirebaseUserModel()
    expect(u.isAdmin()).toBeFalsy();
  });
})
