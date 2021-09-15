import { NgModule } from '@angular/core'
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NgxImageZoomModule } from 'ngx-image-zoom'

import { HomeComponent } from './components/home.component'
import { HomeIndexComponent } from './components/homeIndex.component'
import { DemoTerminalComponent } from './components/demoTerminal.component'
import { HomeFeaturesComponent } from './components/homeFeatures.component'
import { InstanceInfoResolver } from '../api'

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
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        NgbNavModule,
        FontAwesomeModule,
        NgxImageZoomModule,
        RouterModule.forChild(ROUTES),
    ],
    declarations: [
        HomeComponent,
        HomeIndexComponent,
        HomeFeaturesComponent,
        DemoTerminalComponent,
    ],
})
export class HomepageModule { }
