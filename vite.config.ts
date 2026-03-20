import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: mode === 'production' ? '/money-talks/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'anthropic-proxy',
        configureServer(server) {
          server.middlewares.use('/api/anthropic', (req, res) => {
            const apiKey = env.ANTHROPIC_API_KEY
            if (!apiKey) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                content: [],
                fallback: true,
                error: 'ANTHROPIC_API_KEY not set in .env',
              }))
              return
            }

            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', async () => {
              try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                  },
                  body,
                })
                const data = await response.text()
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = response.status
                res.end(data)
              } catch (e) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: String(e) }))
              }
            })
          })
        },
      },
    ],
  }
})
