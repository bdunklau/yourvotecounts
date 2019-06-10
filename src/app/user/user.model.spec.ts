import { FirebaseUserModel } from './user.model'

describe('FirebaseUserModel', () => {

  it('should be an Admin 1', () => {
    let u = new FirebaseUserModel()
    u.roles = ["admin"]
    expect(u.hasRole('admin')).toBeTruthy();
  });

  it('should be an Admin 2', () => {
    let u = new FirebaseUserModel()
    u.roles = ["role1", "admin"]
    expect(u.hasRole('admin')).toBeTruthy();
  });

  it('should not be an Admin 1', () => {
    let u = new FirebaseUserModel()
    u.roles = ["role1"]
    expect(u.hasRole('admin')).toBeFalsy();
  });

  it('should not be an Admin 2', () => {
    let u = new FirebaseUserModel()
    expect(u.hasRole('admin')).toBeFalsy();
  });
})
