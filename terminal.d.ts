/// <reference types="node" />
import 'core-js/proposals/reflect-metadata';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import 'source-code-pro/source-code-pro.css';
import 'source-sans-pro/source-sans-pro.css';
import { Duplex } from 'stream-browserify';
export declare class Socket extends Duplex {
    webSocket: WebSocket;
    constructor();
    connect(): void;
    setNoDelay(): void;
    setTimeout(): void;
    _read(size: number): void;
    _write(chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
    _destroy(error: Error | null, callback: (error: Error | null) => void): void;
}
