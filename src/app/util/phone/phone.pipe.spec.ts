import { PhonePipe } from './phone.pipe';

describe('PhonePipe', () => {
  it('create an instance', () => {
    console.log('PhonePipe: begin')
    const pipe = new PhonePipe();
    expect(pipe).toBeTruthy();
    console.log('PhonePipe: end')
  });
});
