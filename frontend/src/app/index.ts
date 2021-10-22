import { NgModule } from '@angular/core'
import { NgbDropdownModule, NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { MainComponent } from './components/main.component'
import { ConfigModalComponent } from './components/configModal.component'
import { SettingsModalComponent } from './components/settingsModal.component'
import { ConnectionListComponent } from './components/connectionList.component'
import { UpgradeModalComponent } from './components/upgradeModal.component'
import { InstanceInfoResolver } from 'src/api'
import { CommonAppModule } from 'src/common'

const ROUTES = [
    {
        path: '',
        component: MainComponent,
        resolve: {
            instanceInfo: InstanceInfoResolver,
        },
    },
]

@NgModule({
    imports: [
        CommonAppModule,
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        NgbModalModule,
        NgbTooltipModule,
        ClipboardModule,
        FontAwesomeModule,
        RouterModule.forChild(ROUTES),
    ],
    declarations: [
        MainComponent,
        ConfigModalComponent,
        SettingsModalComponent,
        ConnectionListComponent,
        UpgradeModalComponent,
    ],
})
export class ApplicationModule { }
