import { Component } from '@angular/core'
import { LoginService } from '../services/login.service'

import { faGithub, faGitlab, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons'

@Component({
    selector: 'app',
    templateUrl: './app.component.pug',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
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
    ) {
        this.providers = [this.providers[0]] // only keep GH for now
    }

    async ngOnInit () {
        await this.loginService.ready$.toPromise()
        this.loggedIn = !!this.loginService.user
        this.ready = true
    }
}
