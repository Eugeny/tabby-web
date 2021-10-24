import { Inject, Injectable, Optional } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class CommonService {
  backendURL: string

  constructor (@Inject('BACKEND_URL') @Optional() ssrBackendURL: string) {
    const tag = document.querySelector('meta[property=x-tabby-web-backend-url]')! as HTMLMetaElement
    if (ssrBackendURL) {
      this.backendURL = ssrBackendURL
      tag.content = ssrBackendURL
    } else {
      if (tag.content && !tag.content.startsWith('{{')) {
        this.backendURL = tag.content
      } else {
        this.backendURL = ''
      }
    }

    console.log(this.backendURL)
    if (this.backendURL.endsWith('/')) {
      this.backendURL = this.backendURL.slice(0, -1)
    }
  }
}
