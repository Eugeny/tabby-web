import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faGift, faHeart } from '@fortawesome/free-solid-svg-icons'

import { LoginService } from '../services/login.service'
import { AppConnectorService } from '../services/appConnector.service'
import { CommonService } from '../services/common.service'
import { User } from '../api'

@Component({
    selector: 'upgrade-modal',
    templateUrl: './upgradeModal.component.pug',
})
export class UpgradeModalComponent {
    user: User
    _githubIcon = faGithub
    _loveIcon = faHeart
    _giftIcon = faGift
    canSkip = false

    constructor (
        public appConnector: AppConnectorService,
        public commonService: CommonService,
        public loginService: LoginService,
        private modalInstance: NgbActiveModal,
    ) {
        this.canSkip = !window.localStorage['upgrade-modal-skipped']
    }

    skipOnce () {
        window.localStorage['upgrade-modal-skipped'] = true
        window.sessionStorage['upgrade-skip-active'] = true
        this.modalInstance.close(true)
    }
}
