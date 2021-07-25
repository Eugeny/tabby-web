import { Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Observable, from } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { CommonService } from './services/common.service'

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
    constructor (private commonService: CommonService) { }

    intercept (request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!request.url.startsWith('//') && request.url.startsWith('/')) {
            return from(this.commonService.getBackendURL()).pipe(switchMap((baseUrl: string) => {
                const endpoint = request.url

                request = request.clone({
                    url: `${baseUrl}${endpoint}`,
                })
                return next.handle(request)
            }))
        }
        return next.handle(request)
    }
}
