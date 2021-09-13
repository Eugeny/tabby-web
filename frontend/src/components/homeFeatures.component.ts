import { Component } from '@angular/core'

@Component({
    selector: 'home-features',
    templateUrl: './homeFeatures.component.pug',
    styleUrls: ['./homeFeatures.component.scss'],
})
export class HomeFeaturesComponent {
    screenshots = {
        progress: require('../assets/screenshots/progress.png'),
        zmodem: require('../assets/screenshots/zmodem.png'),
    }
}
