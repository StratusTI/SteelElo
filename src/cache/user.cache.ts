import { ensureRedisConnected } from '@/src/lib/redis'
import type { UserDTO } from '@/types/user'

const PREFIX = 'user:'
const TTL = 15 * 60 // 15 minutes (same as access token)

export const UserCache = {
  async get(userId: string): Promise<UserDTO | null> {
    const client = await ensureRedisConnected()
    const data = await client.get(`${PREFIX}${userId}`)

    if (!data) return null

    return JSON.parse(data) as UserDTO
  },

  async set(userId: string, user: UserDTO): Promise<void> {
    const client = await ensureRedisConnected()
    await client.set(`${PREFIX}${userId}`, JSON.stringify(user), { EX: TTL })
  },

  async invalidate(userId: string): Promise<void> {
    const client = await ensureRedisConnected()
    await client.del(`${PREFIX}${userId}`)
  },
}
