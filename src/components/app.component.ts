import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Component({
    selector: 'app',
    templateUrl: './app.component.pug',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    user: any
    ready = false

    constructor (
        private http: HttpClient,
    ) { }

    async ngOnInit () {
        const user = await this.http.get('/api/1/user').toPromise()
        if (user.id) {
            this.user = user
        }
        this.ready = true
    }
}
