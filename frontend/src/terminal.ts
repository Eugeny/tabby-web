import './terminal-styles.scss'

async function start () {
    window['__filename'] = ''

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

    document.querySelector('app-root')['style'].display = 'flex'

    const tabby = window['Tabby']

    const pluginURLs = connector.getPluginsToLoad().map(x => `${baseUrl}/${x}`)
    const pluginModules = await tabby.loadPlugins(pluginURLs, (current, total) => {
        (document.querySelector('.progress .bar') as HTMLElement).style.width = `${100 * current / total}%` // eslint-disable-line
    })

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
