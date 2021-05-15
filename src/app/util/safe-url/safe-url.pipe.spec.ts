import { SafeUrlPipe } from './safe-url.pipe';

// TODO FIXME test
xdescribe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
