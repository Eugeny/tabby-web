import { Subject } from 'rxjs'
import * as semverCompare from 'semver/functions/compare-loose'
import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, ViewChild } from '@angular/core'
import { Version } from 'src/api'
import { CommonService } from 'src/common'

class DemoConnector {
  constructor (
    targetWindow: Window,
    private commonService: CommonService,
    private version: Version,
  ) {
    targetWindow['tabbyWebDemoDataPath'] = `${this.getDistURL()}/${version.version}/tabby-web-demo/data`
  }

  async loadConfig (): Promise<string> {
    return `{
            recoverTabs: false,
            web: {
                preventAccidentalTabClosure: false,
            },
        }`
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async saveConfig (_content: string): Promise<void> { }

  getAppVersion (): string {
    return this.version.version
  }

  getDistURL (): string {
    return this.commonService.backendURL + '/app-dist'
  }

  getPluginsToLoad (): string[] {
    return [
      'tabby-core',
      'tabby-settings',
      'tabby-terminal',
      'tabby-community-color-schemes',
      'tabby-ssh',
      'tabby-telnet',
      'tabby-web',
      'tabby-web-demo',
    ]
  }

  createSocket () {
    return new DemoSocketProxy()
  }
}


export class DemoSocketProxy {
  connect$ = new Subject<void>()
  data$ = new Subject<Buffer>()
  error$ = new Subject<Error>()
  close$ = new Subject<Buffer>()

  async connect () {
    this.error$.next(new Error('This web demo can\'t actually access Internet, but feel free to download the release and try it out!'))
  }
}

@Component({
  selector: 'demo-terminal',
  template: '<iframe #iframe></iframe>',
  styleUrls: ['./demoTerminal.component.scss'],
})
export class DemoTerminalComponent {
  @ViewChild('iframe') iframe: ElementRef
  connector: DemoConnector


  constructor (
    private http: HttpClient,
    private commonService: CommonService,
  ) {
    window.addEventListener('message', this.connectorRequestHandler)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  connectorRequestHandler = event => {
    if (event.data === 'request-connector') {
      this.iframe.nativeElement.contentWindow['__connector__'] = this.connector
      this.iframe.nativeElement.contentWindow.postMessage('connector-ready', '*')
    }
  }

  async ngAfterViewInit (): Promise<void> {
    const versions = (await this.http.get('/api/1/versions').toPromise()) as Version[]
    versions.sort((a, b) => -semverCompare(a.version, b.version))
    this.connector = new DemoConnector(this.iframe.nativeElement.contentWindow, this.commonService, versions[0]!)
    this.iframe.nativeElement.src = '/terminal'
  }

  ngOnDestroy (): void {
    window.removeEventListener('message', this.connectorRequestHandler)
  }
}
