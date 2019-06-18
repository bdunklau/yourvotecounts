import { MainPage } from './main.po';
import { browser, logging, element, by } from 'protractor';
import { TokenPage } from './token.po';
import { AdminPage } from './admin.po';

fdescribe('Admins', () => {
  // let page: PublicPage;
  let page: MainPage;
  let tokenPage: TokenPage;
  let adminPage: AdminPage;

  beforeEach(() => {
    // page = new PublicPage();
    page = new MainPage();
    tokenPage = new TokenPage();
    adminPage = new AdminPage();
  });

  it('should be able to get to Log page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickLog();
    expect(page.getTitleText()).toEqual('Log');
    page.clickLogout()
  });

  fit('should be able to view logs by level', async () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    // page.clickHome();
    page.clickLog();

    browser.sleep(3000);
    var infoItems = await adminPage.getLogEntries('info');
    var infoCount = 0;
    for(var i=0; i < infoItems.length; i++) {
      var txt = infoItems[i].getText();
      console.log("txt ->  '"+txt+"'") // NEVER GETS CALLED!!!
      if(txt === 'info') {
        ++infoCount;
      }
    }
    expect(infoCount > 0).toBeTruthy();


    // adminPage.setLevel('debug');
    // adminPage.getLogEntries('debug').then(function(items) {
    //   expect(items.length > 0).toBeTruthy();
    // });



    // adminPage.getLogEntries('info').then(function(items) {
    //   var infoCount = 0;
    //   for(var i=0; i < items.length; i++) {
    //     items[i].getText().then(function(text) {
    //       console.log('info text: ', text)
    //       if(text === 'info') {
    //         ++infoCount;
    //       }
    //     })
    //   }
    //   expect(infoCount > 0).toBeTruthy();
    // });

    // adminPage.getLogEntries('info')
    //
    // var value = adminPage.getLogEntries('info').reduce(function(acc, elem) {
    //     return elem.getText().then(function(text) {
    //         console.log ("CHECK:  "+acc + text + " ");
    //     });
    // }, ' ');

    // err.then(function(items) {
    //   console.log('error items: ', items);
    //   for(var i=0; i < items.length; i++) {
    //     console.log('error items['+i+'].getWebElement(): ', items[i].getWebElement());
    //   }
    //   expect(items.length > 0).toBeTruthy();
    // });

    // page.clickLogout()
  });

  it('should be able to get to Users page', () => {
    tokenPage.login(process.env.YOURVOTECOUNTS_ADMIN_PHONE_NUMBER);
    page.clickHome();
    page.clickUsers();
    expect(page.getTitleText()).toEqual('Users');
    page.clickLogout()
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
