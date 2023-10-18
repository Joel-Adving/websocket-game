import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'

const origin = ['localhost', 'localhost:3000', 'localhost:4321']

const gameId = '1'
const players = new Map()

const app = new Elysia()
  .use(cors({ origin }))
  .ws('', {
    open(ws) {
      const { playerId } = ws.data.query as { playerId: string }

      if (!players.has(playerId)) {
        players.set(playerId, {
          playerId,
          x: 0,
          y: 0,
          color: 'black',
          scale: 10,
          movementSpeed: 10,
          movement: {
            up: false,
            down: false,
            left: false,
            right: false
          }
        })
      }

      const data = {
        type: 'player-joined',
        playerId,
        state: players.get(playerId)
      }

      ws.subscribe(gameId)
      ws.publish(gameId, data)

      ws.send({
        type: 'on-join',
        playerId,
        state: {
          players: Array.from(players.values()).filter((p) => p.playerId !== playerId)
        }
      })
    },

    message(ws, message: any) {
      if (message.type === 'player-update') {
        const player = players.get(message.playerId)
        if (player) {
          player.movement = message.state.movement
          player.x = message.state.x
          player.y = message.state.y
        }
      }
      ws.publish(gameId, message)
    },

    close(ws, code, message) {
      console.log('close', code, message)
      const msg = `Player ${message} disconnected`
      players.delete(message)
      ws.publish(gameId, msg)
      ws.unsubscribe(gameId)
    }
  })
  .listen(3000)

console.log(`Server running at ${app.server?.hostname}:${app.server?.port}`)
