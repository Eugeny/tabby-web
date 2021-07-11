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

    async function prefetchURL (url) {
        await (await fetch(url)).text()
    }

    const baseUrl = `${connector.getDistURL()}/${appVersion}`
    const coreURLs = [
        `${baseUrl}/tabby-web-container/dist/preload.js`,
        `${baseUrl}/tabby-web-container/dist/bundle.js`,
    ]

    await Promise.all(coreURLs.map(prefetchURL))

    for (const url of coreURLs) {
        await webRequire(url)
    }

    const tabby = window['Tabby']

    const pluginURLs = connector.getPluginsToLoad().map(x => `${baseUrl}/${x}`)
    const pluginModules = await tabby.loadPlugins(pluginURLs)

    document.querySelector('app-root')['style'].display = 'flex'

    const config = connector.loadConfig()
    tabby.bootstrap({
        packageModules: pluginModules,
        bootstrapData: {
            config,
            executable: 'web',
            isFirstWindow: true,
            windowID: 1,
            installedPlugins: [],
            userPluginsPath: '/',
        },
        debugMode: false,
        connector,
    })
}
start()
