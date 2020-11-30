import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import 'localstorage-polyfill'
var tiny = require('tiny-json-http')

const domino = require("domino");
const fs = require("fs");
const path = require("path");
const templateA = fs
  .readFileSync(path.join("dist/yourvotecounts/browser", "index.html"))
  .toString();
const win = domino.createWindow(templateA);
win.Object = Object;
win.Math = Math;

global["window"] = win;
global["document"] = win.document;
global["branch"] = null;
global["object"] = win.object;
global['HTMLElement'] = win.HTMLElement;
global['navigator'] = win.navigator;
global['localStorage'] = localStorage;



import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

// Polyfills required for Firebase
(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/yourvotecounts/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  async function generateMetaTags(req, res, next) {
      /**
       * Call firebase function (check for "-bd737" or "-dev")
       *     -  /getVideoInfo?compositionSid=[CompositionSid]
       *     -  use  https://www.npmjs.com/package/tiny-json-http
       * Pass the compositionSid - get the response (json)
       * put that info in req object
       * server.get('*') below looks for these req attributes
       */
      let isDev = req.hostname.indexOf("-dev") != -1
      let isLocal = req.hostname.toLowerCase().indexOf("local") != -1
      let host = isDev || isLocal ? "us-central1-yourvotecounts-dev.cloudfunctions.net" : "us-central1-yourvotecounts-bd737.cloudfunctions.net"
      let url = `https://${host}/getVideoInfo?compositionSid=${req.params.compositionSid}`
      let meta = await tiny.get({url}) // https://www.npmjs.com/package/tiny-json-http
      console.log("generateMetaTags():  meta.body.image = \n", meta.body.image)
      console.log("generateMetaTags():  meta.body.title = \n", meta.body.title)
      console.log("generateMetaTags():  meta.body.description = \n", meta.body.description)
      req['image'] = meta.body.image
      req['description'] = meta.body.description
      req['title'] = meta.body.title
      console.log('generateMetaTags():  compositionSid = ', req.params.compositionSid)
      console.log('generateMetaTags():  req[\'image\'] = ', req['image'])
      next()
  }


  async function enforceHttps(req, res, next) {
      if(!req.secure /*&& !req.get('host').startsWith('localhost')*/) {
          res.redirect(301, "https://" + req.headers.host + req.originalUrl);
      }
      next()
  }


  server.use('*', enforceHttps)


  // Only this route will call generateMetaTags()
  server.use('/view-video/:compositionSid', generateMetaTags)

  
  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
      // look at req.image, .description, .title - if they exist, do find/replace in the (err, html) callback below
      res.render(indexHtml, 
               { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] },
                 (err, html) => {                   
                  // see    https://css-tricks.com/essential-meta-tags-social-media/
                  if(req['image']) html = html.replace(/\$OG_IMAGE/g, req['image']);
                  let title = req['title'] ? req['title'] : 'Heads Up!'
                  html = html.replace(/\$OG_TITLE/g, title);
                  let description = req['description'] ? req['description'] : 'Recorded video chat made easy'
                  html = html.replace(/\$OG_DESCRIPTION/g, description);
                  // console.log('server.get(*): html  = \n\n', html)
                  // console.log('server.get(\'*\'):  req[\'image\'] = ', req['image'])
                  res.send(html)
               }
      );
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
