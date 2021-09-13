import { Component, Injectable } from '@angular/core'
import { ActivatedRoute, Router, Resolve } from '@angular/router'
import { faCoffee, faDownload, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { InstanceInfo } from '../api'


@Component({
    selector: 'home',
    templateUrl: './home.component.pug',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    githubURL = 'https://github.com/Eugeny/tabby'
    releaseURL = `${this.githubURL}/releases/latest`
    donationURL = 'https://ko-fi.com/eugeny'

    _logo = require('../assets/logo.svg')
    _downloadIcon = faDownload
    _loginIcon = faSignInAlt
    _donateIcon = faCoffee

    navLinks = [
        {
            title: 'About Tabby',
            link: '/'
        },
        {
            title: 'Features',
            link: '/features'
        },
    ]

    instanceInfo: InstanceInfo

    constructor (
        public route: ActivatedRoute,
        public router: Router,
    ) {
        this.instanceInfo = route.snapshot.data.instanceInfo
        if (!this.instanceInfo.homepage_enabled) {
            router.navigate(['/app'])
        }
    }

    static async preload () {
        const three = await import(/* webpackChunkName: "gfx" */ 'three')
        window['THREE'] = three
        await import(/* webpackChunkName: "gfx" */ 'vanta/src/vanta.waves.js')
    }

    async ngAfterViewInit (): Promise<void> {
        window['VANTA'].WAVES({
            el: 'body',
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x70f
        })
    }
}

@Injectable({ providedIn: 'root' })
export class HomeComponentPreloadResolver implements Resolve<Promise<void>> {
    resolve () {
        return HomeComponent.preload()
    }
}
