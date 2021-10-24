import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { User } from 'src/api'
import { CommonService, LoginService } from 'src/common'
import { AppConnectorService } from '../services/appConnector.service'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'settings-modal',
  templateUrl: './settingsModal.component.pug',
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
    if (!loginService.user) {
      return
    }
    this.user = { ...loginService.user }
    this.customGatewayEnabled = !!this.user.custom_connection_gateway
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
