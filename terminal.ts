import 'core-js/proposals/reflect-metadata'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/brands.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import 'source-code-pro/source-code-pro.css'
import 'source-sans-pro/source-sans-pro.css'
import * as yaml from 'js-yaml'
import { Duplex } from 'stream-browserify'
import { Buffer } from 'buffer'


export class Socket extends Duplex {
    webSocket: WebSocket

    constructor () {
        console.warn('socket constr', arguments)
        super({
            allowHalfOpen: false,
        })
    }

    connect () {
        this.webSocket = new WebSocket('ws://localhost:9001/')
        this.webSocket.onopen = event => {
            this.emit('connect')
        }
        this.webSocket.onmessage = async event => {
            this.emit('data', Buffer.from(await event.data.arrayBuffer()))
        }
    }

    setNoDelay () {

    }

    setTimeout () {

    }

    _read (size: number): void {
        console.warn('socket read', size)
    }

    _write (chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void {
        console.warn('socket write', chunk)
        this.webSocket.send(chunk)
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

    let windowReadyCallback
    const configContent = `
        enableAnalytics: false
        enableWelcomeTab: false
        terminal:
            font: "Source Code Pro"
            autoOpen: true
        appearance:
            vibrancy: false
        pluginBlacklist: []
    `
    const config = yaml.load(configContent)

    const mocks = {
        fs: {
            realpathSync: path => {
                console.warn('mock realPathSync', path)
                return path
            },
            existsSync: path => {
                if (path === 'app-path/config.yaml') {
                    return true
                }
                console.warn('mock existsSync', path)
                return false
            },
            mkdir: path => {
                console.warn('mock mkdir', path)
            },
            mkdirSync: path => {
                console.warn('mock mkdirSync', path)
            },
            stat: (path, cb) => {
                if ([
                    'resources/builtin-plugins',
                    'resources/builtin-plugins/terminus-core/package.json',
                    'resources/builtin-plugins/terminus-ssh/package.json',
                    'resources/builtin-plugins/terminus-settings/package.json',
                    'resources/builtin-plugins/terminus-terminal/package.json',
                ].includes(path)) {
                    cb(null, {})
                } else {
                    console.warn('mock stat', path)
                    cb('ENOEXIST')
                }
            },
            writeFileSync: () => null,
            readFileSync: (path) => {
                if (path === 'app-path/config.yaml') {
                    return configContent
                }
                return ''
            },
            readFile: (path, enc, cb) => {
                if ([
                    'resources/builtin-plugins/terminus-core/package.json',
                    'resources/builtin-plugins/terminus-ssh/package.json',
                    'resources/builtin-plugins/terminus-terminal/package.json',
                    'resources/builtin-plugins/terminus-settings/package.json',
                ].includes(path)) {
                    cb(null, '{ "keywords": ["terminus-builtin-plugin"], "author": "" }')
                } else {
                    console.warn('mock readFile', path)
                    cb('UNKNOWN', null)
                }
            },
            readdir: (path, cb) => {
                if (path === 'resources/builtin-plugins') {
                    cb(null, [
                        'terminus-core',
                        'terminus-ssh',
                        'terminus-settings',
                        'terminus-terminal',
                    ])
                } else {
                    console.warn('mock readdir', path)
                    cb(null, [])
                }
            },
            constants: {},
        },
        '@electron/remote': {
            app: {
                getVersion: () => '1.0-web',
                getPath: () => 'app-path',
                getWindow: () => ({
                    reload: () => null,
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
                on: () => null,
                once: (e, c) => {
                    if (e === 'start') {
                        windowReadyCallback = c
                    }
                },
                send: msg => {
                    if (msg === 'ready') {
                        windowReadyCallback(null, {
                            config,
                            executable: '---',
                        })
                    }
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
            }
        },
        stream: require('stream-browserify'),
        events: require('events'),
        readline: {
            cursorTo: () => null,
            clearLine: stream => stream.write('\r'),
        },
        zlib: require('browserify-zlib'),
        util: {
            ...require('util'),
            promisify: () => null,
        },
        'any-promise': Promise,
        net: {
            Socket,
        },
        module: {
            globalPaths: [],
        },
        assert: require('assert'),
        url: {
            parse: () => null,
        },
        http: {
            Agent: { prototype: {} },
            request: {},
        },
        https: {
            Agent: { prototype: {} },
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
            platform: () => 'linux',
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
        constants: {},
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
        keytar: {
            getPassword: () => null,
        },
    }

    ;(mocks.assert as any).assertNotStrictEqual = () => true
    ;(mocks.assert as any).notStrictEqual = () => true

    let builtins = {
        '@angular/core': require('@angular/core'),
        '@angular/compiler': require('@angular/compiler'),
        '@angular/common': require('@angular/common'),
        '@angular/forms': require('@angular/forms'),
        '@angular/platform-browser': require('@angular/platform-browser'),
        '@angular/platform-browser/animations': require('@angular/platform-browser/animations'),
        '@angular/platform-browser-dynamic': require('@angular/platform-browser-dynamic'),
        '@angular/animations': require('@angular/animations'),
        '@ng-bootstrap/ng-bootstrap': require('@ng-bootstrap/ng-bootstrap'),
        'ngx-toastr': require('ngx-toastr'),
        'deepmerge': require('deepmerge'),
        'rxjs': require('rxjs'),
        'rxjs/operators': require('rxjs/operators'),
        'js-yaml': require('js-yaml'),
        'zone.js/dist/zone.js': require('zone.js/dist/zone.js'),
    }

    Object.assign(window, {
        require: (path) => {
            if (mocks[path]) {
                return mocks[path]
            }
            if (builtins[path]) {
                return builtins[path]
            }
            console.warn('requiring', path)
        },
        process: {
            env: { XWEB: 1, LOGNAME: 'root' },
            argv: ['terminus'],
            platform: 'linux',
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

    window['require'].main = {
        paths: []
    }

    window['module'] = {
        paths: []
    }

    window['require'].resolve = path => null
    window['Buffer'] = mocks.buffer.Buffer
    window['__dirname'] = '__dirname'
    window['setImmediate'] = setTimeout
    mocks.module['prototype'] = { require: window['require'] }

    let pluginCode = {
        core: await import(/* webpackChunkName: "app" */ '../terminus/terminus-core/dist/index.js'),
        ssh: await import(/* webpackChunkName: "app" */ '../terminus/terminus-ssh/dist/index.js'),
        settings: await import(/* webpackChunkName: "app" */ '../terminus/terminus-settings/dist/index.js'),
        terminal: await import(/* webpackChunkName: "app" */ '../terminus/terminus-terminal/dist/index.js'),
    }

    function loadPlugin (name) {
        let code = `(function (exports, require, module) { \n${pluginCode[name].default}\n })`
        let m = eval(code)
        let module = { exports: {} }
        m(module.exports, window['require'], module)
        return module.exports
    }

    for (const plugin of ['core', 'settings', 'terminal', 'ssh']) {
        builtins[`resources/builtin-plugins/terminus-${plugin}`] = builtins[`terminus-${plugin}`] = loadPlugin(plugin)
    }

    await import(/* webpackChunkName: "app" */ '../terminus/app/dist/preload.js')
    document.querySelector('app-root')['style'].display = 'flex'
    await import(/* webpackChunkName: "app" */ '../terminus/app/dist/bundle.js')
}

start()
