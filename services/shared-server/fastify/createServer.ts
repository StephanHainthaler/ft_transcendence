import Fastify, { FastifyServerOptions } from "fastify";
import { Agent, setGlobalDispatcher } from 'undici';
import fs from "fs";

function loadHttpsOptions(): { key: Buffer; cert: Buffer } | null {
  const keyPath = process.env.SSL_KEY_PATH || "/app/certs/server.key";
  const certPath = process.env.SSL_CERT_PATH || "/app/certs/server.crt";

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  return null;
}

if (process.env.HTTP_PROTOCOL === 'https') {
  setGlobalDispatcher(new Agent({
    connect: { rejectUnauthorized: false }
  }));
}

export function createServer(options?: FastifyServerOptions) {
  const httpsOpts = loadHttpsOptions();

  return Fastify({
    logger: {
      transport: {
        target: 'pino-pretty'
      },
    },
    disableRequestLogging: true,
    ...(httpsOpts ? { https: httpsOpts } : {}),
    ...options
  });
}
