import { NgModule } from '@angular/core'
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { TransferHttpCacheModule } from '@nguniversal/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UniversalInterceptor } from './interceptor'
import { AppComponent } from './components/app.component'
import { MainComponent } from './components/main.component'
import { ConfigModalComponent } from './components/configModal.component'
import { SettingsModalComponent } from './components/settingsModal.component'
import { HomeComponent } from './components/home.component'
import { LoginComponent } from './components/login.component'
import { InstanceInfoResolver } from './api'

// import '@fortawesome/fontawesome-svg-core/styles.css'

const ROUTES = [
    {
        path: '',
        component: HomeComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        },
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
        FontAwesomeModule,
        ClipboardModule,
        RouterModule.forRoot(ROUTES),
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: UniversalInterceptor,
            multi: true,
        },
    ],
    declarations: [
        AppComponent,
        MainComponent,
        HomeComponent,
        LoginComponent,
        ConfigModalComponent,
        SettingsModalComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
