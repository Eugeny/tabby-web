import { Component, ElementRef, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AppConnectorService } from '../services/appConnector.service'

import { faCog, faCopy, faTrash, faPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { LoginService } from '../services/login.service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { SettingsModalComponent } from './settingsModal.component'
import { ConfigModalComponent } from './configModal.component'
import { ConfigService } from '../services/config.service'
import { combineLatest } from 'rxjs'
import { Config, Version } from '../api'
import { Router } from '@angular/router'

@Component({
    selector: 'main',
    templateUrl: './main.component.pug',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent {
    _logo = require('../assets/logo.svg')
    _cogIcon = faCog
    _settingsIcon = faCog
    _logoutIcon = faSignOutAlt
    _copyIcon = faCopy
    _addIcon = faPlus
    _deleteIcon = faTrash

    showApp = false

    @ViewChild('iframe') iframe: ElementRef

    constructor (
        public appConnector: AppConnectorService,
        private http: HttpClient,
        public loginService: LoginService,
        private ngbModal: NgbModal,
        private config: ConfigService,
        private router: Router,
    ) {
        window.addEventListener('message', this.connectorRequestHandler)
    }

    connectorRequestHandler = event => {
        if (event.data === 'request-connector') {
            this.iframe.nativeElement.contentWindow['__connector__'] = this.appConnector
            this.iframe.nativeElement.contentWindow.postMessage('connector-ready', '*')
        }
    }

    async ngAfterViewInit () {
        await this.loginService.ready$.toPromise()
        if (!this.loginService.user) {
            this.router.navigate(['/login'])
            return
        }

        combineLatest(
            this.config.activeConfig$,
            this.config.activeVersion$
        ).subscribe(([config, version]) => {
            if (config && version) {
                this.reloadApp(config, version)
            }
        })
        this.config
        await this.config.ready$.toPromise()
        await this.config.selectDefaultConfig()
    }

    ngOnDestroy () {
        window.removeEventListener('message', this.connectorRequestHandler)
    }

    unloadApp () {
        this.showApp = false
        this.iframe.nativeElement.src = 'about:blank'
    }

    async loadApp (config, version) {
        this.showApp = true
        this.iframe.nativeElement.src = '/terminal'
        await this.http.patch(`/api/1/configs/${config.id}`, {
            last_used_with_version: version.version,
        }).toPromise()
    }

    reloadApp (config: Config, version: Version) {
        // TODO check config incompatibility
        this.unloadApp()
        setTimeout(() => {
            this.appConnector.setState(config, version)
            this.loadApp(config, version)
        })
    }

    async openConfig () {
        await this.ngbModal.open(ConfigModalComponent).result
    }

    async openSettings () {
        await this.ngbModal.open(SettingsModalComponent).result
    }

    async logout () {
        await this.http.post('/api/1/auth/logout', null).toPromise()
        location.href = '/'
    }
}
