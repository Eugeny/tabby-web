import { Buffer } from 'buffer'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Injectable, Injector, NgZone } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { UpgradeModalComponent } from '../components/upgradeModal.component'
import { Config, Gateway, Version } from 'src/api'
import { LoginService, CommonService } from 'src/common'

export class SocketProxy {
    connect$ = new Subject<void>()
    data$ = new Subject<Uint8Array>()
    error$ = new Subject<Error>()
    close$ = new Subject<void>()

    url: string
    authToken: string
    webSocket: WebSocket|null
    initialBuffers: any[] = []
    options: {
        host: string
        port: number
    }

    private appConnector: AppConnectorService
    private loginService: LoginService
    private ngbModal: NgbModal
    private zone: NgZone

    constructor (
        injector: Injector,
    ) {
        this.appConnector = injector.get(AppConnectorService)
        this.loginService = injector.get(LoginService)
        this.ngbModal = injector.get(NgbModal)
        this.zone = injector.get(NgZone)
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async connect (options: any): Promise<void> {
        if (!this.loginService.user.is_pro && this.appConnector.sockets.length > this.appConnector.connectionLimit && !window.sessionStorage['upgrade-skip-active']) {
            let skipped = false
            try {
                skipped = await this.zone.run(() => this.ngbModal.open(UpgradeModalComponent)).result
            } catch { }
            if (!skipped) {
                this.close(new Error('Connection limit reached'))
                return
            }
        }

        this.options = options
        this.url = this.loginService.user.custom_connection_gateway
        this.authToken = this.loginService.user.custom_connection_gateway_token
        if (!this.url) {
            try {
                const gateway = await this.appConnector.chooseConnectionGateway()
                this.url = gateway.url
                this.authToken = gateway.auth_token
            } catch (err) {
                this.close(err)
                return
            }
        }
        try {
            this.webSocket = new WebSocket(this.url)
        } catch (err) {
            this.close(err)
            return
        }
        this.webSocket.onerror = err => {
            this.close(new Error(`Failed to connect to the connection gateway at ${this.url}`))
            return
        }
        this.webSocket.onmessage = async event => {
            if (typeof(event.data) === 'string') {
                this.handleServiceMessage(JSON.parse(event.data))
            } else {
                this.data$.next(Buffer.from(await event.data.arrayBuffer()))
            }
        }
        this.webSocket.onclose = () => {
            this.close()
        }
    }

    handleServiceMessage (msg) {
        if (msg._ === 'hello') {
            this.sendServiceMessage({
                _: 'hello',
                version: 1,
                auth_token: this.authToken,
            })
        } else if (msg._ === 'ready') {
            this.sendServiceMessage({
                _: 'connect',
                host: this.options.host,
                port: this.options.port,
            })
        } else if (msg._ === 'connected') {
            this.connect$.next()
            this.connect$.complete()
            for (const b of this.initialBuffers) {
                this.webSocket.send(b)
            }
            this.initialBuffers = []
        } else if (msg._ === 'error') {
            console.error('Connection gateway error', msg)
            this.close(new Error(msg.details))
        } else {
            console.warn('Unknown service message', msg)
        }
    }

    sendServiceMessage (msg) {
        this.webSocket.send(JSON.stringify(msg))
    }

    write (chunk: Buffer): void {
        if (!this.webSocket?.readyState) {
            this.initialBuffers.push(chunk)
        } else {
            this.webSocket.send(chunk)
        }
    }

    close (error?: Error): void {
        this.webSocket?.close()
        if (error) {
            this.error$.next(error)
        }
        this.connect$.complete()
        this.data$.complete()
        this.error$.complete()
        this.close$.next()
        this.close$.complete()
    }
}

@Injectable({ providedIn: 'root' })
export class AppConnectorService {
    private configUpdate = new Subject<string>()
    private config: Config
    private version: Version
    connectionLimit = 3
    sockets: SocketProxy[] = []

    constructor (
        private injector: Injector,
        private http: HttpClient,
        private commonService: CommonService,
        private zone: NgZone,
    ) {

        this.configUpdate.pipe(debounceTime(1000)).subscribe(async content => {
            const result = await this.http.patch(`/api/1/configs/${this.config.id}`, { content }).toPromise()
            Object.assign(this.config, result)
        })
    }

    setState (config: Config, version: Version) {
        this.config = config
        this.version = version
    }

    async loadConfig (): Promise<string> {
        return this.config.content
    }

    async saveConfig (content: string): Promise<void> {
        this.configUpdate.next(content)
        this.config.content = content
    }

    getAppVersion (): string {
        return this.version.version
    }

    getDistURL (): string {
        return this.commonService.backendURL + '/app-dist'
    }

    getPluginsToLoad (): string[] {
        const loadOrder = [
            'tabby-core',
            'tabby-settings',
            'tabby-terminal',
            'tabby-ssh',
            'tabby-community-color-schemes',
            'tabby-web',
        ]

        return [
            ...loadOrder.filter(x => this.version.plugins.includes(x)),
            ...this.version.plugins.filter(x => !loadOrder.includes(x)),
        ]
    }

    createSocket () {
        return this.zone.run(() => {
            const socket = new SocketProxy(this.injector)
            this.sockets.push(socket)
            socket.close$.subscribe(() => {
                this.sockets = this.sockets.filter(x => x !== socket)
            })
            return socket
        })
    }

    async chooseConnectionGateway (): Promise<Gateway> {
        try {
            return await this.http.post('/api/1/gateways/choose', {}).toPromise()
        } catch (err){
            if (err.status === 503) {
                throw new Error('All connections gateway are unavailable right now')
            }
            throw err
        }
    }
}
