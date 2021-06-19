import { Buffer } from 'buffer'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

export class SocketProxy {
    connect$ = new Subject<void>()
    data$ = new Subject<Buffer>()

    webSocket: WebSocket
    initialBuffer: Buffer

    constructor (...args) {
        console.log('ws ctr', args)
        this.initialBuffer = Buffer.from('')
    }

    connect (...args) {
        console.log('ws connect', args)
        this.webSocket = new WebSocket(`ws://${location.host}/api/1/gateway/tcp`)
        this.webSocket.onopen = event => {
            this.connect$.next()
            this.connect$.complete()
            this.webSocket.send(this.initialBuffer)
            this.initialBuffer = Buffer.from('')
        }
        this.webSocket.onmessage = async event => {
            this.data$.next(Buffer.from(await event.data.arrayBuffer()))
        }
    }

    write (chunk: Buffer): void {
        if (!this.webSocket.readyState) {
            this.initialBuffer = Buffer.concat([this.initialBuffer, chunk])
        } else {
            this.webSocket.send(chunk)
        }
    }

    close (error: Error): void {
        console.warn('socket destroy', error)
    }
}

@Injectable({ providedIn: 'root' })
export class AppConnectorService {
    config: any
    version: any
    Socket = SocketProxy
    private configUpdate = new Subject<string>()

    constructor (private http: HttpClient) {
        this.configUpdate.pipe(debounceTime(1000)).subscribe(async content => {
            const result = await this.http.patch(`/api/1/configs/${this.config.id}`, { content }).toPromise()
            Object.assign(this.config, result)
        })
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
}
