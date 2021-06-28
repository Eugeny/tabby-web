import { NgModule } from '@angular/core'
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { AppComponent } from './components/app.component'
import { MainComponent } from './components/main.component'
import { ConfigModalComponent } from './components/configModal.component'
import { SettingsModalComponent } from './components/settingsModal.component'
import { HomeComponent } from './components/home.component'
import { LoginComponent } from './components/login.component'
import { InstanceInfoResolver } from './api'

const ROUTES = [
    {
        path: '',
        component: HomeComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        }
    },
    {
        path: 'app',
        component: MainComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        }
    },
    {
        path: 'login',
        component: LoginComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        }
    },
]

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        HttpClientXsrfModule,
        NgbDropdownModule,
        NgbModalModule,
        FontAwesomeModule,
        RouterModule.forRoot(ROUTES),
    ],
    declarations: [
        AppComponent,
        MainComponent,
        HomeComponent,
        LoginComponent,
        ConfigModalComponent,
        SettingsModalComponent,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
