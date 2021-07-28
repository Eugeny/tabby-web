import { Component } from '@angular/core'
import { LoginService } from '../services/login.service'

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { User } from '../api'
import { AppConnectorService } from '../services/appConnector.service'
import { CommonService } from '../services/common.service'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'

@Component({
    selector: 'settings-modal',
    templateUrl: './settingsModal.component.pug',
    // styleUrls: ['./settingsModal.component.scss'],
})
export class SettingsModalComponent {
    user: User
    customGatewayEnabled = false
    _githubIcon = faGithub
    _copyIcon = faCopy
    _okIcon = faCheck

    constructor (
        public appConnector: AppConnectorService,
        public commonService: CommonService,
        private modalInstance: NgbActiveModal,
        private loginService: LoginService,
    ) {
        this.user = { ...loginService.user }
        this.customGatewayEnabled = !!this.user.custom_connection_gateway
    }

    async ngOnInit () {
    }

    async apply () {
        Object.assign(this.loginService.user, this.user)
        this.modalInstance.close()
        await this.loginService.updateUser()
    }

    cancel () {
        this.modalInstance.dismiss()
    }
}
