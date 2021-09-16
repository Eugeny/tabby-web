import { NgModule } from '@angular/core'
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { TransferHttpCacheModule } from '@nguniversal/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component'
import { CommonAppModule } from 'src/common'

import '@fortawesome/fontawesome-svg-core/styles.css'

const ROUTES = [
    {
        path: '',
        loadChildren: () => import(/* webpackChunkName: "homepage" */'./homepage').then(m => m.HomepageModule),
    },
    {
        path: 'app',
        loadChildren: () => import(/* webpackChunkName: "app" */'./app').then(m => m.ApplicationModule),
    },
    {
        path: 'login',
        loadChildren: () => import(/* webpackChunkName: "login" */'./login').then(m => m.LoginModule),
    },
]

@NgModule({
    imports: [
        BrowserModule.withServerTransition({
            appId: 'tabby',
        }),
        CommonAppModule.forRoot(),
        TransferHttpCacheModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        NgbModalModule,
        FontAwesomeModule,
        ClipboardModule,
        HttpClientModule,
        RouterModule.forRoot(ROUTES),
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
