import { PublicPage } from './public.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';

fdescribe('Public page', () => {
  let page: PublicPage;
  let tokenPage: TokenPage;

  beforeEach(() => {
    page = new PublicPage();
    tokenPage = new TokenPage();
  });

  it('when user logs in, should be able to get to Register page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER)
    // browser.get(browser.baseUrl);
    page.clickHome();
    expect(page.getTitleText()).toEqual('home');
    page.clickRegister();
    expect(page.getTitleText()).toEqual('Complete Your Account');
    page.logout();
  });

  it('should be able to logout', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_NORMAL_PHONE_NUMBER);
    page.clickHome();
    page.clickRegister();
    expect(page.getTitleText()).toEqual('Complete Your Account');
    page.logout();
    page.clickRegister();
    expect(page.getUrl()).toEqual(browser.baseUrl+'/login');
  });

  // We don't want the UI to display a "Token" link.  That's only for e2e testing.
  fit('should not display a "Token" link', async () => {
    page.gotoBaseUrl();
    var home_link = element(by.id('home_link')); // sanity check
    expect(home_link.isDisplayed()).toBeTruthy();

    var myText = "Token";
    var selectedElement = element(by.xpath("//*[. = '" + myText + "']"));

    expect(selectedElement.isPresent()).toBeFalsy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
