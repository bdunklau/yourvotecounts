import { PublicPage } from './public.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

describe('Public page', () => {
  let page: PublicPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new PublicPage();
    tokenPage = new TokenPage();
  });



  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
