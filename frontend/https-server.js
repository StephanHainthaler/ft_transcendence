import { createServer } from 'node:https'
import { readFileSync } from 'node:fs'
import http from 'node:http'

const cert = readFileSync(process.env.HTTPS_CERT || '/app/certs/server.crt')
const key = readFileSync(process.env.HTTPS_KEY || '/app/certs/server.key')

http.createServer = function (optsOrHandler, handler) {
    if (typeof optsOrHandler === 'function') {
        return createServer({ cert, key }, optsOrHandler)
    }
    return createServer({ cert, key, ...optsOrHandler }, handler)
}

await import('./build/index.js')
