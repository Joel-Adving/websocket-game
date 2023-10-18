type Context = {
  playerId: string
  ip: string
}

const gameId = '1'
const players = new Map()

export const server = Bun.serve<Context>({
  port: 3000,
  async fetch(req, server) {
    const url = new URL(req.url)
    const ip = server.requestIP(req)
    if (url.pathname === '/ws') {
      const playerId = getCookieByName(req.headers.get('Cookie') ?? '', 'playerId') ?? crypto.randomUUID()
      server.upgrade(req, {
        data: { playerId, ip },
        headers: {
          'Set-Cookie': `playerId=${playerId}; Max-Age=${60 * 60 * 24 * 365}`
        }
      })
      return
    }
    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    perMessageDeflate: true,
    open(ws) {
      const playerId = ws.data.playerId
      if (!players.has(playerId)) {
        players.set(playerId, {
          playerId,
          x: 0,
          y: 0,
          color: 'black',
          scale: 1,
          movementSpeed: 10,
          movement: {
            up: false,
            down: false,
            left: false,
            right: false
          }
        })
      }
      ws.subscribe(gameId)
      ws.publish(
        gameId,
        JSON.stringify({
          type: 'player-joined',
          playerId,
          state: players.get(playerId)
        })
      )
      ws.send(
        JSON.stringify({
          type: 'on-join',
          playerId,
          state: {
            players: Array.from(players.values()).filter((p) => p.playerId !== playerId)
          }
        })
      )
    },
    message(ws, message) {
      const data = JSON.parse(message as string)
      if (data.type === 'player-update') {
        const player = players.get(data.playerId)
        if (player) {
          player.movement = data.state.movement
          player.x = data.state.x
          player.y = data.state.y
        }
      }
      if (data.type === 'player-disconnected') {
        ws.publish(
          gameId,
          JSON.stringify({
            type: 'player-disconnected',
            playerId: data.playerId
          })
        )
        players.delete(data.playerId)
      }
      ws.publish(gameId, message)
    },
    close(ws, code, message) {
      ws.unsubscribe(gameId)
    }
  }
})

function getCookieByName(cookie: string, name: string) {
  const value = `; ${cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}
