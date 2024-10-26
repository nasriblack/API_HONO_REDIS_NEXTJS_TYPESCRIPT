import { Redis } from '@upstash/redis'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

type EnvConfig = {
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}

// Initialize Redis client outside the request handler
let redis: Redis | null = null
const getRedisClient = (envConfig: EnvConfig) => {
  if (!redis) {
    redis = new Redis({
      url: envConfig.UPSTASH_REDIS_REST_URL,
      token: envConfig.UPSTASH_REDIS_REST_TOKEN
    })
  }
  return redis
}

app.use('/*', cors())
app.get('/search', async (c) => {
  try {
    const start = performance.now()

    const envConfig = env<EnvConfig>(c)
    // Get or create Redis client
    const redisClient = getRedisClient(envConfig)

    const query = c.req.query('q')?.toUpperCase()

    if (!query) {
      return c.json({
        message: 'Invalid search query'
      }, {
        status: 400
      })
    }

    const res = []
    const rank = await redisClient.zrank("terms", query)

    if (rank !== null && rank !== undefined) {
      const temp = await redisClient.zrange<string[]>("terms", rank, rank + 100)

      for (const el of temp) {
        if (!el.startsWith(query)) {
          break;
        }
        if (el.endsWith('*')) {
          res.push(el.substring(0, el.length - 1))
        }
      }
    }

    const end = performance.now()

    return c.json({
      results: res,
      duration: end - start,
    })
  } catch (error) {
    console.error(error)
    return c.json({
      results: [],
      message: 'Something went wrong'
    }, {
      status: 500
    })
  }
})

export const GET = handle(app)
export default app as never