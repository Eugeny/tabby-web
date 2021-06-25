export interface User {
    active_config: number
    active_version: string
    custom_connection_gateway: string|null
    custom_connection_gateway_token: string|null
    is_pro: boolean
}

export interface Config {
    id: number
    content: string
    last_used_with_version: string
    created_at: Date
    modified_at: Date
}

export interface Version {
    version: string
}
