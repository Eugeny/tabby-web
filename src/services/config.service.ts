import * as semverGT from 'semver/functions/gt'
import { AsyncSubject, Subject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Config, User, Version } from '../api'
import { LoginService } from './login.service'


@Injectable({ providedIn: 'root' })
export class ConfigService {
    activeConfig$ = new Subject<Config>()
    activeVersion$ = new Subject<Version>()
    user: User

    configs: Config[] = []
    versions: Version[] = []
    ready$ = new AsyncSubject<void>()

    get activeConfig (): Config { return this._activeConfig }
    get activeVersion (): Version { return this._activeVersion }

    private _activeConfig: Config|null = null
    private _activeVersion: Version|null = null

    constructor (
        private http: HttpClient,
        private loginService: LoginService,
    ) {
        this.init()
    }

    async updateUser () {
        await this.http.put('/api/1/user', this.user).toPromise()
    }

    async createNewConfig (): Promise<Config> {
        const config = await this.http.post('/api/1/configs', {
            content: '{}',
            last_used_with_version: this._activeVersion?.version ?? this.getLatestStableVersion().version,
        }).toPromise()
        this.configs.push(config)
        return config
    }

    getLatestStableVersion () {
        return this.versions[0]
    }

    async duplicateActiveConfig () {
        const copy = {...this._activeConfig, pk: undefined}
        this.configs.push(await this.http.post('/api/1/configs', copy).toPromise())
    }

    async selectVersion (version: Version) {
        this._activeVersion = version
        this.activeVersion$.next(version)
    }

    async selectConfig (config: Config) {
        let matchingVersion = this.versions.find(x => x.version === config.last_used_with_version)
        if (!matchingVersion) {
            // TODO ask to upgrade
            matchingVersion = this.versions[0]
        }

        this._activeConfig = config
        this.activeConfig$.next(config)
        this.selectVersion(matchingVersion)
        this.loginService.user.active_config = config.id
        await this.loginService.updateUser()
    }

    async selectDefaultConfig () {
        await this.ready$.toPromise()
        await this.loginService.ready$.toPromise()
        this.selectConfig(this.configs.find(c => c.id === this.loginService.user.active_config) ?? this.configs[0])
    }

    private async init () {
        this.configs = await this.http.get('/api/1/configs').toPromise()
        this.versions = await this.http.get('/api/1/versions').toPromise()
        this.versions.sort((a, b) => semverGT(a.version, b.version))

        if (!this.configs.length) {
            await this.createNewConfig()
        }

        this.ready$.next()
        this.ready$.complete()
    }
}
