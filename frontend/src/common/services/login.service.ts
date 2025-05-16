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

  async updateUser (): Promise<void> {
    if (!this.user) {
      return
    }
    await this.http.put('/api/1/user', this.user).toPromise()
  }

  private async init () {
    try {
      this.user = (await this.http.get('/api/1/user').toPromise()) as User
    } catch {
      this.user = null
    }

    this.ready$.next()
    this.ready$.complete()
  }

  async login(username: string, password: string): Promise<User> {
      return (await this.http.post<any>('/api/1/auth/login', { username, password }).toPromise()) as User;
    }
}
