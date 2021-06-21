import * as semverGT from 'semver/functions/gt'
import { Component, ElementRef, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AppConnectorService } from '../services/appConnector.service'

import { faCog, faUser, faCopy, faTrash, faPlus, faPlug } from '@fortawesome/free-solid-svg-icons'
import { LoginService } from '../services/login.service'

@Component({
    selector: 'main',
    templateUrl: './main.component.pug',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent {
    _logo = require('../assets/logo.svg')
    _cogIcon = faCog
    _userIcon = faUser
    _copyIcon = faCopy
    _addIcon = faPlus
    _deleteIcon = faTrash
    _connectionIcon = faPlug

    configs: any[] = []
    versions: any[] = []
    activeVersion?: any
    @ViewChild('iframe') iframe: ElementRef

    constructor (
        private appConnector: AppConnectorService,
        private http: HttpClient,
        public loginService: LoginService,
    ) {
        window.addEventListener('message', event => {
            if (event.data === 'request-connector') {
                this.iframe.nativeElement.contentWindow['__connector__'] = this.appConnector
                this.iframe.nativeElement.contentWindow.postMessage('connector-ready', '*')
            }
        })
    }

    async ngAfterViewInit () {
        this.configs = await this.http.get('/api/1/configs').toPromise()
        this.versions = await this.http.get('/api/1/versions').toPromise()

        this.versions.sort((a, b) => semverGT(a, b))

        if (!this.configs.length) {
            await this.createNewConfig()
        }

        this.selectConfig(this.configs[0])
    }

    async createNewConfig () {
        this.configs.push(await this.http.post('/api/1/configs', {
            content: '{}',
            last_used_with_version: this.versions[0].version,
        }).toPromise())
    }

    async duplicateConfig () {
        const copy = {...this.appConnector.config, pk: undefined}
        this.configs.push(await this.http.post('/api/1/configs', copy).toPromise())
    }

    unloadApp () {
        delete this.activeVersion
        this.iframe.nativeElement.src = 'about:blank'
    }

    loadApp (version) {
        this.iframe.nativeElement.src = '/terminal'
        this.activeVersion = version
    }

    getActiveConfig () {
        return this.appConnector.config
    }

    selectVersion (version: any) {
        // TODO check config incompatibility
        this.unloadApp()
        setTimeout(() => {
            this.appConnector.version = version
            this.loadApp(version)
        })
    }

    async selectConfig (config: any) {
        let matchingVersion = this.versions.find(x => x.version === config.last_used_with_version)
        if (!matchingVersion) {
            // TODO ask to upgrade
            matchingVersion = this.versions[0]
        }

        this.appConnector.config = config

        const result = await this.http.patch(`/api/1/configs/${config.id}`, {
            last_used_with_version: matchingVersion.version,
        }).toPromise()
        Object.assign(config, result)

        this.selectVersion(matchingVersion)
    }

    async logout () {
        await this.http.post('/api/1/auth/logout', null).toPromise()
        location.href = '/'
    }
}
