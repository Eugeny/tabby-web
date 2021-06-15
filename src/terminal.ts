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


import { Duplex } from 'stream-browserify'

import 'core-js/proposals/reflect-metadata'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/brands.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import 'source-code-pro/source-code-pro.css'
import 'source-sans-pro/source-sans-pro.css'

import './terminal-styles.scss'

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
    const mocks = {

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
            ipcRenderer: { // TODO remove
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
        net: {
            Socket,
        },

        // winston: {
        //     Logger,
        //     transports: {
        //         File: Object,
        //         Console: Object,
        //     }
        // },
        // 'mz/child_process': {
        //     exec: (...x) => Promise.reject(),
        // },
        // 'mz/fs': {
        //     readFile: path => mocks.fs.readFileSync(path),
        //     exists: path => mocks.fs.existsSync(path),
        //     existsSync: path => mocks.fs.existsSync(path),
        // },
    }

    let builtins = {
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

    const appVersion = location.search.substring(1)

    async function loadPlugin (name, file = 'index.js') {
        const url = `../app-dist/${appVersion}/${name}/dist/${file}`
        console.log(`Loading ${url}`)
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

    await loadPlugin('web', 'preload.js')
    await loadPlugin('web', 'bundle.js')

    const pluginModules = []
    for (const plugin of [
        'terminus-core',
        'terminus-settings',
        'terminus-terminal',
        'terminus-ssh',
        'terminus-community-color-schemes',
        'terminus-web',
    ]) {
        const mod = await loadPlugin(plugin)
        builtins[`resources/builtin-plugins/${plugin}`] = builtins[plugin] = mod
        pluginModules.push(mod)
    }

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
