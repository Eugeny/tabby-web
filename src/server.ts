import 'zone.js/dist/zone-node';
import { enableProdMode } from '@angular/core';

require('source-map-support').install()

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';

import './ssr-polyfills'

import * as express from 'express'
import { join } from 'path'

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'build');

import { AppServerModule } from './app.server.module'

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });

// Server static files from /browser
app.use('/static', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

var proxy = require('express-http-proxy');

app.get(['/', '/login'], (req, res) => {
  res.render('index', { req });
});


app.use('/', proxy('http://tabby.local:8000/api/', {
}))

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
