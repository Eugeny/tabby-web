import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { AppConnectorService } from '../services/appConnector.service'
import { ConfigService } from '../services/config.service'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

@Component({
    selector: 'config-modal',
    templateUrl: './configModal.component.pug',
    // styleUrls: ['./settingsModal.component.scss'],
})
export class ConfigModalComponent {
    _addIcon = faPlus

    constructor (
        private modalInstance: NgbActiveModal,
        public appConnector: AppConnectorService,
        public configService: ConfigService,
    ) {
    }

    async ngOnInit () {
    }

    cancel () {
        this.modalInstance.dismiss()
    }

}
