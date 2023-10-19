import cors from '@elysiajs/cors'
import Elysia from 'elysia'
import { Game, Player } from './types'
import { createNewPlayer } from './gameUtils'

const origin = ['localhost:3000', 'localhost:4321', 'ws-game.oki.gg', 'game.oki.gg']

const games = new Map<string, Game>()

games.set('1', {
  id: '1',
  players: new Map<string, Player>()
})

new Elysia()
  .use(cors({ origin }))

  .get('/', () => 'Hello and welcome to the most epic web socket game')

  .ws('/ws/game/:id', {
    open(ws) {
      const { id: gameId } = ws.data.params as { id: string }
      const playerId = ws.data.cookie.playerId.get()
      const game = games.get(gameId)

      if (game) {
        const foundPlayer = game.players.get(playerId)
        if (!foundPlayer) {
          const newPlayer = createNewPlayer(playerId)
          game.players.set(playerId, newPlayer)
        }

        ws.subscribe(gameId)

        ws.publish(gameId, {
          type: 'player-joined',
          playerId,
          state: game.players.get(playerId)
        })

        ws.send({
          type: 'on-join',
          playerId,
          state: {
            players: Array.from(game.players.values()).filter((p) => p.playerId !== playerId)
          }
        })

        console.log(games)
      }
    },

    message(ws, message) {
      const { id: gameId } = ws.data.params as { id: string }
      const data = message as any
      const game = games.get(gameId)

      if (game) {
        if (data.type === 'player-update') {
          const player = game.players.get(data.playerId)
          if (player) {
            player.movement = data.state.movement
            player.x = data.state.x
            player.y = data.state.y
          }
        }

        if (data.type === 'player-disconnected') {
          ws.publish(gameId, {
            type: 'player-disconnected',
            playerId: data.playerId
          })
          game.players.delete(data.playerId)
        }

        ws.publish(gameId, message)
      }
    },

    close(ws, code, message) {
      const { id: gameId } = ws.data.params as { id: string }
      const userId = ws.data.cookie.playerId.get()
      console.log('connection closed', { code, message, gameId, userId })
      games.get(gameId)?.players.delete(userId)
      ws.unsubscribe(gameId)
    }
  })

  .listen(3000)
