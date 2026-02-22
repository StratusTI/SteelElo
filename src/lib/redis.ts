import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

function createRedisClient() {
  const client = createClient({ url: process.env.REDIS_URL })

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err)
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export async function ensureRedisConnected() {
  if (!redis.isOpen) {
    await redis.connect()
  }
  return redis
}
