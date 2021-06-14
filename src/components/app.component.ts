import { Component, ElementRef, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AppConnectorService } from '../services/appConnector.service'

@Component({
    selector: 'app',
    templateUrl: './app.component.pug',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    _logo = require('../assets/logo.svg')
    showApp = false
    configs: any[] = []
    @ViewChild('iframe') iframe: ElementRef

    constructor (
        private appConnector: AppConnectorService,
        private http: HttpClient,
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
        this.selectConfig(this.configs[0])
    }

    unloadApp () {
        this.showApp = false
        this.iframe.nativeElement.src = 'about:blank'
    }

    loadApp () {
        this.iframe.nativeElement.src = '/terminal'
        this.showApp = true
    }

    selectConfig (config: any) {
        this.appConnector.config = config
        this.unloadApp()
        setTimeout(() => {
            this.loadApp()
        })
    }
}
