import { install } from 'source-map-support'

import 'zone.js/dist/zone-node'
import './ssr-polyfills'

import { enableProdMode } from '@angular/core'
import { ngExpressEngine } from '@nguniversal/express-engine'

import * as express from 'express'
import { join } from 'path'

install()
enableProdMode()

const app = express()

const PORT = process.env.PORT || 4000
const DIST_FOLDER = join(process.cwd(), 'build')

import { AppServerModule } from './app.server.module'

app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
}))

app.set('view engine', 'html')
app.set('views', DIST_FOLDER)

app.get('*.*', express.static(DIST_FOLDER, {
    maxAge: '1y',
}))

app.get('*', (req, res) => {
    res.render('index', { req })
})

app.listen(PORT, () => {
    console.log(`Node Express server listening on http://localhost:${PORT}`)
})
