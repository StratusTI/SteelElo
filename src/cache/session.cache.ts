import { ensureRedisConnected } from '@/src/lib/redis'

const PREFIX = 'session:'
const TTL = 7 * 24 * 60 * 60 // 7 days (same as refresh token)

export const SessionCache = {
  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const client = await ensureRedisConnected()
    await client.set(`${PREFIX}${userId}`, token, { EX: TTL })
  },

  async getRefreshToken(userId: string): Promise<string | null> {
    const client = await ensureRedisConnected()
    return client.get(`${PREFIX}${userId}`)
  },

  async invalidateRefreshToken(userId: string): Promise<void> {
    const client = await ensureRedisConnected()
    await client.del(`${PREFIX}${userId}`)
  },
}
