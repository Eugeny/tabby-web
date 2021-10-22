import { AsyncSubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { User } from '../../api'


@Injectable({ providedIn: 'root' })
export class LoginService {
    user: User | null
    ready$ = new AsyncSubject<void>()

    constructor (private http: HttpClient) {
        this.init()
    }

    async updateUser () {
        if (!this.user) {
            return
        }
        await this.http.put('/api/1/user', this.user).toPromise()
    }

    private async init () {
        try {
            this.user = await this.http.get('/api/1/user').toPromise()
        } catch {
            this.user = null
        }

        this.ready$.next()
        this.ready$.complete()
    }
}
