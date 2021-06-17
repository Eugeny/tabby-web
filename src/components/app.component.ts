import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { faGithub, faGitlab, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons'

@Component({
    selector: 'app',
    templateUrl: './app.component.pug',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    user: any
    ready = false

    providers = [
        { name: 'GitHub', icon: faGithub, cls: 'btn-primary', id: 'github' },
        { name: 'GitLab', icon: faGitlab, cls: 'btn-warning', id: 'gitlab' },
        { name: 'Google', icon: faGoogle, cls: 'btn-secondary', id: 'google-oauth2' },
        { name: 'Microsoft', icon: faMicrosoft, cls: 'btn-light', id: 'microsoft-graph' },
    ]

    constructor (
        private http: HttpClient,
    ) { }

    async ngOnInit () {
        const user = await this.http.get('/api/1/user').toPromise()
        if (user.id) {
            this.user = user
        }
        this.ready = true
    }
}
