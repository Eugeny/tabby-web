import { install } from 'source-map-support'
import * as throng from 'throng'

import 'zone.js/dist/zone-node'
import './ssr-polyfills'

import { enableProdMode } from '@angular/core'
import { ngExpressEngine } from '@nguniversal/express-engine'

import * as express from 'express'
import { join } from 'path'


install()
enableProdMode()

import { AppServerModule } from './app.server.module'

const engine = ngExpressEngine({
    bootstrap: AppServerModule,
})

function start () {
    const app = express()

    const PORT = process.env.PORT || 8000
    const DIST_FOLDER = join(process.cwd(), 'build')

    app.engine('html', engine)

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
}

const WORKERS = process.env.WEB_CONCURRENCY || 4
throng({
    workers: WORKERS,
    lifetime: Infinity,
    start,
})
