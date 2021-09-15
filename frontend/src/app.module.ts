import { NgModule } from '@angular/core'
import { NgbDropdownModule, NgbModalModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { TransferHttpCacheModule } from '@nguniversal/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NgxImageZoomModule } from 'ngx-image-zoom'

import { BackendXsrfInterceptor, UniversalInterceptor } from './interceptor'
import { AppComponent } from './components/app.component'
import { MainComponent } from './components/main.component'
import { ConfigModalComponent } from './components/configModal.component'
import { SettingsModalComponent } from './components/settingsModal.component'
import { HomeComponent } from './components/home.component'
import { LoginComponent } from './components/login.component'
import { ConnectionListComponent } from './components/connectionList.component'
import { UpgradeModalComponent } from './components/upgradeModal.component'
import { HomeIndexComponent } from './components/homeIndex.component'
import { DemoTerminalComponent } from './components/demoTerminal.component'
import { HomeFeaturesComponent } from './components/homeFeatures.component'
import { InstanceInfoResolver } from './api'

import '@fortawesome/fontawesome-svg-core/styles.css'

const ROUTES = [
    {
        path: '',
        component: HomeComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        },
        children: [
            {
                path: '',
                component: HomeIndexComponent,
            },
            {
                path: 'features',
                component: HomeFeaturesComponent,
            },
        ],
    },
    {
        path: 'app',
        component: MainComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        },
    },
    {
        path: 'login',
        component: LoginComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        },
    },
]

@NgModule({
    imports: [
        BrowserModule.withServerTransition({
            appId: 'tabby',
        }),
        TransferHttpCacheModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        HttpClientXsrfModule,
        NgbDropdownModule,
        NgbModalModule,
        NgbNavModule,
        FontAwesomeModule,
        ClipboardModule,
        NgxImageZoomModule,
        RouterModule.forRoot(ROUTES),
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: BackendXsrfInterceptor, multi: true },
    ],
    declarations: [
        AppComponent,
        MainComponent,
        HomeComponent,
        HomeIndexComponent,
        LoginComponent,
        ConfigModalComponent,
        SettingsModalComponent,
        ConnectionListComponent,
        UpgradeModalComponent,
        DemoTerminalComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
