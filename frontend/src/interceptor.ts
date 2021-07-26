import { Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http'
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

@Injectable()
export class BackendXsrfInterceptor implements HttpInterceptor {
    constructor (
        private commonService: CommonService,
        private tokenExtractor: HttpXsrfTokenExtractor,
    ) { }

    intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.commonService.backendURL && req.url.startsWith(this.commonService.backendURL)) {
            let token = this.tokenExtractor.getToken() as string;
            if (token !== null) {
                req = req.clone({ setHeaders: { 'X-XSRF-TOKEN': token } });
            }
        }
        return next.handle(req);
    }
}
