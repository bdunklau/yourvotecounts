import { Invitation } from './invitation.model';

describe('Invitation', () => {
  it('should create an instance', () => {
    console.log('Invitation: begin')
    expect(new Invitation()).toBeTruthy();
    console.log('Invitation: end')
  });
});
