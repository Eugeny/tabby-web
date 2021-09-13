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
        colors: require('../assets/screenshots/colors.png'),
        hotkeys: require('../assets/screenshots/hotkeys.png'),
        ports: require('../assets/screenshots/ports.png'),
        ssh2: require('../assets/screenshots/ssh2.png'),
        fonts: require('../assets/screenshots/fonts.png'),
        history: require('../assets/screenshots/history.png'),
        paste: require('../assets/screenshots/paste.png'),
        quake: require('../assets/screenshots/quake.png'),
        split: require('../assets/screenshots/split.png'),
        profiles: require('../assets/screenshots/profiles.png'),
    }
}
