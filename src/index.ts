import 'zone.js'
import 'core-js/proposals/reflect-metadata'
import 'core-js/features/array/flat'
import 'rxjs'

import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import './styles.scss'
import { AppModule } from './app.module'



enableProdMode()
platformBrowserDynamic().bootstrapModule(AppModule)
