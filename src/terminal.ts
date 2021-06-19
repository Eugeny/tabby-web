import './terminal-styles.scss'


Object.assign(window, {
    // Buffer,
    process: {
        env: { },
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


async function start () {
    const modules = { }

    Object.assign(window, {
        require: (path) => {
            if (modules[path]) {
                return modules[path]
            }
            console.error('requiring real module', path)
        },
    })

    await new Promise<void>(resolve => {
        window.addEventListener('message', event => {
            if (event.data === 'connector-ready') {
                resolve()
            }
        })
        window.parent.postMessage('request-connector', '*')
    })

    const appVersion = window['__connector__'].getAppVersion()

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
        modules[`resources/builtin-plugins/${plugin}`] = modules[plugin] = mod
        pluginModules.push(mod)
    }

    document.querySelector('app-root')['style'].display = 'flex'

    const config = window['__connector__'].loadConfig()
    window['bootstrapTerminus'](pluginModules, {
        config,
        executable: 'web',
        isFirstWindow: true,
        windowID: 1,
        installedPlugins: [],
        userPluginsPath: '/',
    })
}

start()
