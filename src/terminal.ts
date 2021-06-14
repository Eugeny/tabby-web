Object.assign(window, {
    process: {
        env: { XWEB: 1, LOGNAME: 'root' },
        argv: ['terminus'],
        platform: 'darwin',
        on: () => null,
        stdout: {},
        stderr: {},
        resourcesPath: 'resources',
        version: '14.0.0',
        nextTick: (f, ...args) => setTimeout(() => f(...args)),
        // cwd: () => '/',
    },
    global: window,
})


import * as angularCoreModule from '@angular/core'
import * as angularCompilerModule from '@angular/compiler'
import * as angularCommonModule from '@angular/common'
import * as angularFormsModule from '@angular/forms'
import * as angularPlatformBrowserModule from '@angular/platform-browser'
import * as angularPlatformBrowserAnimationsModule from '@angular/platform-browser/animations'
import * as angularPlatformBrowserDynamicModule from '@angular/platform-browser-dynamic'
import * as angularAnimationsModule from '@angular/animations'
import * as ngBootstrapModule from '@ng-bootstrap/ng-bootstrap'
import * as ngxToastrModule from 'ngx-toastr'


import 'core-js/proposals/reflect-metadata'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/brands.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import 'source-code-pro/source-code-pro.css'
import 'source-sans-pro/source-sans-pro.css'
import { Duplex } from 'stream-browserify'
import { Buffer } from 'buffer'

import './terminal-styles.scss'
import { base64Slice, latin1Slice, utf8Slice, utf8Write } from './polyfills'

export class Socket extends Duplex {
    webSocket: WebSocket
    initialBuffer: Buffer

    constructor () {
        console.warn('socket constr', arguments)
        super({
            allowHalfOpen: false,
        })
        this.initialBuffer = Buffer.from('')
    }

    connect () {
        this.webSocket = new WebSocket(`ws://${location.host}/api/1/gateway/tcp`)
        this.webSocket.onopen = event => {
            this['emit']('connect')
            this.webSocket.send(this.initialBuffer)
            this.initialBuffer = Buffer.from('')
        }
        this.webSocket.onmessage = async event => {
            this['emit']('data', Buffer.from(await event.data.arrayBuffer()))
        }
    }

    setNoDelay () {

    }

    setTimeout () {

    }

    _read (size: number): void {
    }

    _write (chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void {
        if (!this.webSocket.readyState) {
            this.initialBuffer = Buffer.concat([this.initialBuffer, chunk])
        } else {
            this.webSocket.send(chunk)
        }
        callback()
    }

    _destroy (error: Error|null, callback: (error: Error|null) => void): void {
        console.warn('socket destroy', error)
        callback(error)
    }
}

async function start () {
    class Logger {
        constructor () {
            for (let x of ['info', 'warn', 'error', 'log', 'debug']) {
                this[x] = () => null
            }
        }
    }

    const mocks = {
        fs: {
            realpathSync: path => {
                console.warn('mock realPathSync', path)
                return path
            },
            existsSync: path => {
                console.warn('mock existsSync', path)
                return false
            },
            readdir: () => null,
            stat: () => null,
            mkdir: path => {
                console.warn('mock mkdir', path)
            },
            mkdirSync: path => {
                console.warn('mock mkdirSync', path)
            },
            writeFileSync: () => null,
            readFileSync: (path) => {
                return ''
            },
            readFile: (path, enc, cb) => {
                console.warn('mock readFile', path)
                cb('UNKNOWN', null)
            },
            // readdir: (path, cb) => {
            //     if (path === 'resources/builtin-plugins') {
            //         cb(null, [
            //             'terminus-core',
            //             'terminus-ssh',
            //             'terminus-settings',
            //             'terminus-terminal',
            //         ])
            //     } else {
            //         console.warn('mock readdir', path)
            //         cb(null, [])
            //     }
            // },
            constants: {},
        },
        '@electron/remote': {
            app: {
                getVersion: () => '1.0-web',
                getPath: () => 'app-path',
                getWindow: () => ({
                    reload: () => null,
                    setTrafficLightPosition: () => null,
                }),
            },
            screen: {
                on: () => null,
                getAllDisplays: () => [],
                getPrimaryDisplay: () => ({}),
                getCursorScreenPoint: () => ({}),
                getDisplayNearestPoint: () => null,
            },
            globalShortcut: {
                unregisterAll: () => null,
                register: () => null,
            },
            autoUpdater: {
                on: () => null,
                once: () => null,
                setFeedURL: () => null,
                checkForUpdates: () => null,
            },
            BrowserWindow: {
                fromId: () => ({
                    setOpacity: () => null,
                    setProgressBar: () => null,
                }),
            },
            getGlobal: () => window['process'],
        },
        electron: {
            ipcRenderer: {
                on: (e, c) => {
                    console.log('[ipc listen]', e)
                },
                once: (e, c) => {
                    console.log('[ipc listen once]', e)
                },
                send: msg => {
                    console.log('[ipc]', msg)
                }
            },
        },
        path: {
            join: (...x) => x.join('/'),
            basename: x => x,
            dirname: x => x,
            relative: (a, b) => b,
            resolve: (a, b) => {
                console.warn('mock path.resolve', a, b)
                return b
            }
        },
        buffer: {
            Buffer,
        },
        crypto: {
            ...require('crypto-browserify'),
            getHashes () {
                return ['sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'md5', 'rmd160']
            },
            timingSafeEqual (a, b) {
                return a.equals(b)
            },
        },
        events: require('events'),
        readline: {
            cursorTo: () => null,
            clearLine: stream => stream.write('\r'),
        },
        zlib: {
            ...require('browserify-zlib'),
            constants: require('browserify-zlib'),
        },
        'any-promise': Promise,
        net: {
            Socket,
        },
        tls: { },
        module: {
            globalPaths: [],
        },
        assert: require('assert'),
        url: {
            parse: () => null,
        },
        http: {
            Agent: class {},
            request: {},
        },
        https: {
            Agent: class {},
            request: {},
        },
        querystring: {},
        tty: { isatty: () => false },
        child_process: {},
        winston: {
            Logger,
            transports: {
                File: Object,
                Console: Object,
            }
        },
        'readable-stream': {},
        os: {
            platform: () => 'web',
            homedir: () => '/home',
        },
        'mz/child_process': {
            exec: (...x) => Promise.reject(),
        },
        'mz/fs': {
            readFile: path => mocks.fs.readFileSync(path),
            exists: path => mocks.fs.existsSync(path),
            existsSync: path => mocks.fs.existsSync(path),
        },
        constants: require('constants-browserify'),
        'hterm-umdjs': {
            hterm: {
                PreferenceManager: class { set () {} },
                VT: {
                    ESC: {},
                    CSI: {},
                    OSC: {},
                },
                Terminal: class {},
                Keyboard: class {},
            },
            lib: {
                wc: {},
                Storage: {
                    Memory: class {},
                },
            },
        },
        dns: {},
        util: require('util/'),
        keytar: {
            getPassword: () => null,
        },
    }

    ;(mocks.assert as any).assertNotStrictEqual = () => true
    ;(mocks.assert as any).notStrictEqual = () => true

    let builtins = {
        '@angular/core': angularCoreModule,
        '@angular/compiler': angularCompilerModule,
        '@angular/common': angularCommonModule,
        '@angular/forms': angularFormsModule,
        '@angular/platform-browser': angularPlatformBrowserModule,
        '@angular/platform-browser/animations': angularPlatformBrowserAnimationsModule,
        '@angular/platform-browser-dynamic': angularPlatformBrowserDynamicModule,
        '@angular/animations': angularAnimationsModule,
        '@ng-bootstrap/ng-bootstrap': ngBootstrapModule,
        'ngx-toastr': ngxToastrModule,
        'deepmerge': require('deepmerge'),
        'rxjs': require('rxjs'),
        'rxjs/operators': require('rxjs/operators'),
        'js-yaml': require('js-yaml'),
        'zone.js/dist/zone.js': require('zone.js/dist/zone.js'),
    }

    Object.assign(window, {
        require: (path) => {
            if (mocks[path]) {
                console.warn('requiring mock', path)
                return mocks[path]
            }
            if (builtins[path]) {
                return builtins[path]
            }
            console.error('requiring real module', path)
        },
    })

    window['require'].main = {
        paths: []
    } as any

    window['module'] = {
        paths: []
    } as any

    window['require'].resolve = (path => null) as any
    window['Buffer'] = mocks.buffer.Buffer
    window['__dirname'] = '__dirname'
    window['setImmediate'] = setTimeout as any
    mocks.module['prototype'] = { require: window['require'] }

    Buffer.prototype['latin1Slice'] = latin1Slice
    Buffer.prototype['utf8Slice'] = utf8Slice
    Buffer.prototype['base64Slice'] = base64Slice
    Buffer.prototype['utf8Write'] = utf8Write

    builtins['ssh2'] = require('ssh2')
    builtins['ssh2/lib/protocol/constants'] = require('ssh2/lib/protocol/constants')
    builtins['stream'] = require('stream-browserify')

    async function loadPlugin (name, file = 'index.js') {
        const url = `../app-dist/${name}/dist/${file}`
        const e = document.createElement('script')
        window['module'] = { exports: {} } as any
        window['exports'] = window['module'].exports
        await new Promise(resolve => {
            e.onload = resolve
            e.src = url
            document.querySelector('head').appendChild(e)
        })
        return window['module'].exports
    }

    const pluginModules = []
    for (const plugin of [
        'terminus-core',
        'terminus-settings',
        'terminus-terminal',
        'terminus-ssh',
        'terminus-community-color-schemes',
        'terminus-web',
    ]) {
        console.log(`Loading ${plugin}`)
        const mod = await loadPlugin(plugin)
        builtins[`resources/builtin-plugins/${plugin}`] = builtins[plugin] = mod
        pluginModules.push(mod)
    }

    await loadPlugin('app', 'preload.js')
    await loadPlugin('app', 'bundle-web.js')
    document.querySelector('app-root')['style'].display = 'flex'

    await new Promise<void>(resolve => {
        window.addEventListener('message', event => {
            if (event.data === 'connector-ready') {
                resolve()
            }
        })
        window.parent.postMessage('request-connector', '*')
    })

    const config = window['__connector__'].loadConfig()
    window['bootstrapTerminus'](pluginModules, { config })
}

start()
