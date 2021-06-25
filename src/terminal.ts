import './terminal-styles.scss'

async function start () {
    await new Promise<void>(resolve => {
        window.addEventListener('message', event => {
            if (event.data === 'connector-ready') {
                resolve()
            }
        })
        window.parent.postMessage('request-connector', '*')
    })

    const connector = window['__connector__']

    const appVersion = connector.getAppVersion()

    async function webRequire (url) {
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

    const baseUrl = `../app-dist/${appVersion}`
    await webRequire(`${baseUrl}/web/dist/preload.js`)
    await webRequire(`${baseUrl}/web/dist/bundle.js`)

    const terminus = window['Terminus']

    const pluginModules = []
    for (const plugin of [
        'terminus-core',
        'terminus-settings',
        'terminus-terminal',
        'terminus-ssh',
        'terminus-community-color-schemes',
        'terminus-web',
    ]) {
        pluginModules.push(await terminus.loadPlugin(`${baseUrl}/${plugin}`))
    }

    document.querySelector('app-root')['style'].display = 'flex'

    const config = connector.loadConfig()
    terminus.bootstrap(pluginModules, {
        config,
        executable: 'web',
        isFirstWindow: true,
        windowID: 1,
        installedPlugins: [],
        userPluginsPath: '/',
    })
}

start()
