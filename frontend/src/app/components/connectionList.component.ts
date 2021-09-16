import { Component } from '@angular/core'
import { AppConnectorService, SocketProxy } from '../services/appConnector.service'
import { faCircle, faTimes } from '@fortawesome/free-solid-svg-icons'

@Component({
    selector: 'connection-list',
    templateUrl: './connectionList.component.pug',
})
export class ConnectionListComponent {
    _circleIcon = faCircle
    _closeIcon = faTimes

    constructor (
        public appConnector: AppConnectorService,
    ) { }

    closeSocket (socket: SocketProxy) {
        socket.close(new Error('Connection closed by user'))
    }
}
