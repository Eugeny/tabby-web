import { Component } from '@angular/core'
import { LoginService, CommonService } from 'src/common'

import { faGithub, faGitlab, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons'

@Component({
  selector: 'login',
  templateUrl: './login.component.pug',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loggedIn: any
  ready = false

  providers = [
    { name: 'GitHub', icon: faGithub, cls: 'btn-primary', id: 'github' },
    { name: 'GitLab', icon: faGitlab, cls: 'btn-warning', id: 'gitlab' },
    { name: 'Google', icon: faGoogle, cls: 'btn-secondary', id: 'google-oauth2' },
    { name: 'Microsoft', icon: faMicrosoft, cls: 'btn-light', id: 'microsoft-graph' },
  ]

  constructor (
    private loginService: LoginService,
    public commonService: CommonService,
  ) { }

  async ngOnInit () {
    await this.loginService.ready$.toPromise()
    this.loggedIn = !!this.loginService.user
    this.ready = true
  }
}
