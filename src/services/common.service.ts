import { Injectable } from '@angular/core'


@Injectable({ providedIn: 'root' })
export class CommonService {
    private configPromise: Promise<any>
    backendURL$: Promise<string>

    constructor () {
        this.configPromise = this.getConfig()
        this.backendURL$ = this.configPromise.then(cfg => {
            let backendURL = cfg.backendURL
            if (backendURL.endsWith('/')) {
                backendURL = backendURL.slice(0, -1)
            }
            return backendURL
        })
    }

    private async getConfig () {
        return (await fetch('/config.json')).json()
    }
}
