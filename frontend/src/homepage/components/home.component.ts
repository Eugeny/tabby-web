import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { faCoffee, faDownload, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { Waves } from '../vanta/vanta.waves.js'
import { InstanceInfo } from '../../api'


@Component({
    selector: 'home',
    templateUrl: './home.component.pug',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    githubURL = 'https://github.com/Eugeny/tabby'
    releaseURL = `${this.githubURL}/releases/latest`
    donationURL = 'https://ko-fi.com/eugeny'

    _logo = require('../../assets/logo.svg')
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

    background: Waves|undefined

    constructor (
        public route: ActivatedRoute,
        public router: Router,
    ) {
        this.instanceInfo = route.snapshot.data.instanceInfo
        if (!this.instanceInfo.homepage_enabled) {
            router.navigate(['/app'])
        }
    }

    async ngAfterViewInit (): Promise<void> {
        this.background = new Waves({
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

    ngOnDestroy () {
        this.background?.destroy()
    }
}
