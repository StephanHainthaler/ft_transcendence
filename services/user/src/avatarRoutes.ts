import { FastifyInstance } from "fastify";
import { ApiError } from "@server/error/apiError";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { createReadStream } from "node:fs";

const AVATAR_DIR = process.env.AVATAR_DIR;
if (!AVATAR_DIR) throw new Error('AVATAR_DIR env missing');

export const avatarRoutes = (fastify: FastifyInstance) => {
  fastify.get<{
    Params: {
      avatarLocation: string,
    }
  }>('/avatar/:avatarLocation', async (req, reply) => {
    try {
      const { avatarLocation } = req.params;
      if (!avatarLocation) {
        throw new ApiError({ code: 400, message: 'Missing avatarLocation param' });
      }

      const filePath = join(AVATAR_DIR, avatarLocation);

      try {
        await stat(filePath);
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          throw new ApiError({ code: 404, message: 'Avatar not found' });
        }
        throw e;
      }

      const ext = avatarLocation.split('.').pop()?.toLowerCase();
      const contentType = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      }[ext || ''] || 'application/octet-stream';

      reply.type(contentType);
      return createReadStream(filePath);
    } catch (e: any) {
      reply.code(e.code || 500).send({ success: false, message: e.message || 'Internal Server Error' });
    }
  });
}
