import { Buffer } from 'buffer'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { LoginService } from '../services/login.service'
import { Config, Version } from '../api'

export class SocketProxy {
    connect$ = new Subject<void>()
    data$ = new Subject<Buffer>()
    error$ = new Subject<Buffer>()

    webSocket: WebSocket
    initialBuffer: Buffer
    options: {
        host: string
        port: number
    }

    constructor (private appConnector: AppConnectorService) {
        this.initialBuffer = Buffer.from('')
    }

    connect (options) {
        this.options = options
        this.webSocket = new WebSocket(
            this.appConnector.loginService.user.custom_connection_gateway ||
            `ws://${location.host}/api/1/gateway/tcp`
        )
        this.webSocket.onmessage = async event => {
            if (typeof(event.data) === 'string') {
                this.handleServiceMessage(JSON.parse(event.data))
            } else {
                this.data$.next(Buffer.from(await event.data.arrayBuffer()))
            }
        }
    }

    handleServiceMessage (msg) {
        if (msg._ === 'hello') {
            this.sendServiceMessage({
                _: 'hello',
                version: 1,
                auth_token: this.appConnector.loginService.user.custom_connection_gateway_token,
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
            this.webSocket.send(this.initialBuffer)
            this.initialBuffer = Buffer.from('')
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
        if (!this.webSocket.readyState) {
            this.initialBuffer = Buffer.concat([this.initialBuffer, chunk])
        } else {
            this.webSocket.send(chunk)
        }
    }

    close (error: Error): void {
        if (error) {
            this.error$.next(error)
        }
        this.connect$.complete()
        this.data$.complete()
        this.error$.complete()
    }
}

@Injectable({ providedIn: 'root' })
export class AppConnectorService {
    private configUpdate = new Subject<string>()
    private config: Config
    private version: Version

    constructor (
        private http: HttpClient,
        public loginService: LoginService,
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
        return '../app-dist'
    }

    getPluginsToLoad (): string[] {
        return [
            'terminus-core',
            'terminus-settings',
            'terminus-terminal',
            'terminus-ssh',
            'terminus-community-color-schemes',
            'terminus-web',
        ]
    }

    createSocket () {
        return new SocketProxy(this)
    }
}
