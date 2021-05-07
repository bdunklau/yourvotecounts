import { RoomObj } from './room-obj.model';

describe('RoomObj', () => {
  it('should create an instance', () => {
    console.log('RoomObj: begin')
    expect(new RoomObj()).toBeTruthy();
    console.log('RoomObj: end')
  });
});
