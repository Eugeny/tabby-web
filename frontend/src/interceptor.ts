import { Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'
import { CommonService } from './services/common.service'

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
    constructor (private commonService: CommonService) { }

    intercept (request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request.url.startsWith('//') && request.url.startsWith('/')) {
            const endpoint = request.url
            request = request.clone({
                url: `${this.commonService.backendURL}${endpoint}`,
                withCredentials: true,
            })
        }
        return next.handle(request)
    }
}
