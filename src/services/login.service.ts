import { AsyncSubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'


@Injectable({ providedIn: 'root' })
export class LoginService {
    user: any
    ready$ = new AsyncSubject<void>()

    constructor (private http: HttpClient) {
        this.init()
    }

    private async init () {
        const user = await this.http.get('/api/1/user').toPromise()
        this.user = user
        this.ready$.next()
        this.ready$.complete()
    }
}
