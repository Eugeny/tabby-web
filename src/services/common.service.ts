import { Injectable } from '@angular/core'


@Injectable({ providedIn: 'root' })
export class CommonService {
    private  backendURL?: string

    async getBackendURL (): Promise<string> {
        if (!this.backendURL) {
            const config = await (await fetch('/config.json')).json()
            this.backendURL = config.backendURL
            if (this.backendURL.endsWith('/')) {
                this.backendURL = this.backendURL.slice(0, -1)
            }
        }
        return this.backendURL
    }
}
