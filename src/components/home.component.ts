import * as semverGT from 'semver/functions/gt'
import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, ViewChild } from '@angular/core'
import { Version } from '../api'
import { faDownload, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

class DemoConnector {
    constructor (targetWindow: Window, private version: Version) {
        targetWindow['terminusWebDemoDataPath'] = `${this.getDistURL()}/${version.version}/terminus-web-demo/data`
    }

    async loadConfig (): Promise<string> {
        return '{}'
    }

    async saveConfig (content: string): Promise<void> {
    }

    getAppVersion (): string {
        return this.version.version
    }

    getDistURL (): string {
        return '/app-dist'
    }

    getPluginsToLoad (): string[] {
        return [
            'terminus-core',
            'terminus-settings',
            'terminus-terminal',
            'terminus-community-color-schemes',
            'terminus-web',
            'terminus-web-demo',
        ]
    }
}

@Component({
    selector: 'home',
    templateUrl: './home.component.pug',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    @ViewChild('iframe') iframe: ElementRef
    connector: DemoConnector
    githubURL = 'https://github.com/Eugeny/terminus'
    releaseURL = `${this.githubURL}/releases/latest`
    _logo = require('../assets/logo.svg')
    _downloadIcon = faDownload
    _loginIcon = faSignInAlt
    _githubIcon = faGithub
    screenshots = {
        window: require('../assets/screenshots/window.png'),
        tabs: require('../assets/screenshots/tabs.png'),
        ssh: require('../assets/screenshots/ssh.png'),
    }

    constructor (private http: HttpClient) {
        window.addEventListener('message', this.connectorRequestHandler)
    }

    connectorRequestHandler = event => {
        if (event.data === 'request-connector') {
            this.iframe.nativeElement.contentWindow['__connector__'] = this.connector
            this.iframe.nativeElement.contentWindow.postMessage('connector-ready', '*')
        }
    }

    async ngAfterViewInit () {
        const versions = await this.http.get('/api/1/versions').toPromise()
        versions.sort((a, b) => semverGT(a, b))
        this.connector = new DemoConnector(this.iframe.nativeElement.contentWindow, versions[0])
        this.iframe.nativeElement.src = '/terminal'
    }

    ngOnDestroy () {
        window.removeEventListener('message', this.connectorRequestHandler)
    }
}
