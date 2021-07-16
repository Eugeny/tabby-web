import { Subject } from 'rxjs'
import * as semverCompare from 'semver/functions/compare-loose'
import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, ViewChild } from '@angular/core'
import { InstanceInfo, Version } from '../api'
import { faCoffee, faDownload, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ActivatedRoute } from '@angular/router'


class DemoConnector {
    constructor (targetWindow: Window, private version: Version) {
        targetWindow['tabbyWebDemoDataPath'] = `${this.getDistURL()}/${version.version}/tabby-web-demo/data`
    }

    async loadConfig (): Promise<string> {
        return `{
            recoverTabs: false
        }`
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
            'tabby-core',
            'tabby-settings',
            'tabby-terminal',
            'tabby-community-color-schemes',
            'tabby-ssh',
            'tabby-telnet',
            'tabby-web',
            'tabby-web-demo',
        ]
    }

    createSocket () {
        return new DemoSocketProxy()
    }
}


export class DemoSocketProxy {
    connect$ = new Subject<void>()
    data$ = new Subject<Buffer>()
    error$ = new Subject<Buffer>()
    close$ = new Subject<Buffer>()

    async connect (options) {
        this.error$.next(new Error('This web demo can\'t actually access Internet, but feel free to download the release and try it out!'))
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
    githubURL = 'https://github.com/Eugeny/tabby'
    releaseURL = `${this.githubURL}/releases/latest`
    donationURL = 'https://ko-fi.com/eugeny'

    _logo = require('../assets/logo.svg')
    _downloadIcon = faDownload
    _loginIcon = faSignInAlt
    _githubIcon = faGithub
    _donateIcon = faCoffee

    screenshots = {
        window: require('../assets/screenshots/window.png'),
        tabs: require('../assets/screenshots/tabs.png'),
        ssh: require('../assets/screenshots/ssh.png'),
        serial: require('../assets/screenshots/serial.png'),
        win: require('../assets/screenshots/win.png'),
    }

    instanceInfo: InstanceInfo

    constructor (
        private http: HttpClient,
        route: ActivatedRoute,
    ) {
        window.addEventListener('message', this.connectorRequestHandler)
        this.instanceInfo = route.snapshot.data.instanceInfo
    }

    connectorRequestHandler = event => {
        if (event.data === 'request-connector') {
            this.iframe.nativeElement.contentWindow['__connector__'] = this.connector
            this.iframe.nativeElement.contentWindow.postMessage('connector-ready', '*')
        }
    }

    async ngAfterViewInit () {
        const versions = await this.http.get('/api/1/versions').toPromise()
        versions.sort((a, b) => -semverCompare(a.version, b.version))
        this.connector = new DemoConnector(this.iframe.nativeElement.contentWindow, versions[0])
        this.iframe.nativeElement.src = '/terminal'
    }

    ngOnDestroy () {
        window.removeEventListener('message', this.connectorRequestHandler)
    }
}
