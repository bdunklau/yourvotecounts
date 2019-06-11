import { PublicPage } from './public.po';
import { browser, logging } from 'protractor';

describe('YourVoteCounts - Public page', () => {
  let page: PublicPage;

  beforeEach(() => {
    page = new PublicPage();
  });

  it('when user browses to our app he should see the default “public” screen', () => {
    page.navigateToHome();
    expect(page.getTitleText()).toEqual('home');
    page.navigateToLogin()
    page.enterPhone('5555555555')
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
