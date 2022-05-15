import * as semverCompare from 'semver/functions/compare-loose'
import { Subject } from 'rxjs'
import { Version } from './api'

class DemoConnector {
  constructor (
    window: Window,
    private version: Version,
  ) {
    window['tabbyWebDemoDataPath'] = `${this.getDistURL()}/${version.version}/tabby-web-demo/data`
  }

  async loadConfig (): Promise<string> {
    return `{
            recoverTabs: false,
            web: {
                preventAccidentalTabClosure: false,
            },
            terminal: {
              fontSize: 11,
            },
        }`
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async saveConfig (_content: string): Promise<void> { }

  getAppVersion (): string {
    return this.version.version
  }

  getDistURL (): string {
    return 'https://api.tabby.sh/app-dist'
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

// eslint-disable-next-line @typescript-eslint/init-declarations
let iframe: HTMLIFrameElement
// eslint-disable-next-line @typescript-eslint/init-declarations
let version: Version

const connectorRequestHandler = event => {
  if (event.data === 'request-connector') {
    iframe.contentWindow!['__connector__'] = new DemoConnector(iframe.contentWindow!, version)
    iframe.contentWindow!.postMessage('connector-ready', '*')
  }
}

window.addEventListener('message', connectorRequestHandler)

document.addEventListener('DOMContentLoaded', async () => {
  iframe = document.querySelector('iframe')!
  const versions = (await fetch('https://api.tabby.sh/api/1/versions').then(x => x.json())) as Version[]
  versions.sort((a, b) => -semverCompare(a.version, b.version))
  version = versions[0]!
  iframe.src = '/terminal'
})
