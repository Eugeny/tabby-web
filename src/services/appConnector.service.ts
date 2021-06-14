import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class AppConnectorService {
    config: any
    private configUpdate = new Subject<string>()

    constructor (private http: HttpClient) {
        this.configUpdate.pipe(debounceTime(1000)).subscribe(content => {
            this.http.patch(`/api/1/configs/${this.config.id}`, { content }).toPromise()
        })
    }

    async loadConfig (): Promise<string> {
        return this.config.content
    }

    async saveConfig (content: string): Promise<void> {
        this.configUpdate.next(content)
    }
}
