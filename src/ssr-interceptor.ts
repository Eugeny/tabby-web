/**
 * This interceptor ensures that the app makes requests
 * with relative paths correctly server-side.
 * Requests which start with a dot (ex. ./assets/...)
 * or relative ones ( ex. /assets/...) will be converted
 * to absolute paths
 */
import { Inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { REQUEST } from '@nguniversal/express-engine/tokens';

import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
  constructor(
    private readonly injector: Injector,
    @Inject(PLATFORM_ID) private readonly platformId: any) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isServer = isPlatformServer(this.platformId);

    if (isServer && !request.url.startsWith('//') && (request.url.startsWith('./') || request.url.startsWith('/'))) {
      const serverRequest = this.injector.get(REQUEST) as Request;
      console.log(serverRequest)
      const baseUrl = `${serverRequest.protocol}://${serverRequest.get('Host')}`;
      let endpoint = request.url;
      /**
       * ISSUE https://github.com/angular/angular/issues/19224
       * HttpClient doesn't support relative requests server-side
       */
      if (endpoint.startsWith('.')) {
        endpoint = endpoint.substring(1);
      }
      // Now the endpoint starts with '/'
      request = request.clone({
        url: `${baseUrl}${endpoint}`
      });
    }
    return next.handle(request);
  }
}
