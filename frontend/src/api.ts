import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable } from 'rxjs'

export interface User {
    id: number
    active_config: number
    active_version: string
    custom_connection_gateway: string|null
    custom_connection_gateway_token: string|null
    config_sync_token: string
    github_username: string
    is_pro: boolean
    is_sponsor: boolean
}

export interface Config {
    id: number
    content: string
    last_used_with_version: string
    created_at: Date
    modified_at: Date
}

export interface Version {
    version: string
    plugins: string[]
}

export interface InstanceInfo {
    login_enabled: boolean
    homepage_enabled: boolean
}

export interface Gateway {
    host: string
    port: number
    url: string
    auth_token: string
}

@Injectable({ providedIn: 'root' })
export class InstanceInfoResolver implements Resolve<Observable<InstanceInfo>> {
    constructor (private http: HttpClient) { }

    resolve(): Observable<InstanceInfo> {
        return this.http.get('/api/1/instance-info').toPromise()
    }
}
