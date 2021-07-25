import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { AppConnectorService } from '../services/appConnector.service'
import { ConfigService } from '../services/config.service'
import { faCopy, faFile, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Config, Version } from '../api'

@Component({
    selector: 'config-modal',
    templateUrl: './configModal.component.pug',
    // styleUrls: ['./settingsModal.component.scss'],
})
export class ConfigModalComponent {
    _addIcon = faPlus
    _copyIcon = faCopy
    _deleteIcon = faTrash
    _configIcon = faFile

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

    async createNewConfig () {
        const config = await this.configService.createNewConfig()
        await this.configService.selectConfig(config)
        this.modalInstance.dismiss()
    }

    async selectConfig (config: Config) {
        await this.configService.selectConfig(config)
        this.modalInstance.dismiss()
    }

    async selectVersion (version: Version) {
        await this.configService.selectVersion(version)
        this.modalInstance.dismiss()
    }

    async deleteConfig () {
        if (confirm('Delete this config? This cannot be undone.')) {
            await this.configService.deleteConfig(this.configService.activeConfig)
        }
        this.configService.selectDefaultConfig()
        this.modalInstance.dismiss()
    }
}
