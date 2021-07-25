import { Injectable } from '@angular/core'

declare const BACKEND_URL: any

@Injectable({ providedIn: 'root' })
export class CommonService {
    backendURL: string = BACKEND_URL

    constructor () {
        if (this.backendURL.endsWith('/')) {
            this.backendURL = this.backendURL.slice(0, -1)
        }
    }
}
