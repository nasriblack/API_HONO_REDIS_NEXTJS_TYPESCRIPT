import { Redis } from '@upstash/redis'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

type EnvConfig = {
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN:string
}

app.use('/*',cors())
app.get('/search',async (c) => {

  try {
    const start = performance.now()

  const {UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL} = env<EnvConfig>(c)

  const redis =  new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN
  })

  const query = c.req.query('q')?.toUpperCase()

  if(!query) {
    return c.json({
      message:'Invalid search query'
    },{
      status:400
    })
  }

  const res = []
  // rank return the rank of the query inside the terms ( how many the items it is )
  const rank = await redis.zrank("terms",query)


  if(rank !== null && rank !== undefined) {
    const temp = await redis.zrange<string[]>("terms",rank,rank+100)

    for(const el of temp) {
      if(!el.startsWith(query)) {
        break;
      }
      if(el.endsWith('*')) {
        res.push(el.substring(0,el.length-1))
      }
    }
  }

  const end = performance.now()

  return c.json({
    results: res,
    duration: end-start,
  })
  } catch (error) {
    console.error(error)
    return c.json({
      result:[],
      message:'Something went wrong'
    }, {
      status:500
    })
  }
})

export const GET = handle(app)
export default app as never