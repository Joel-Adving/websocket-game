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
  .ws('/ws/game/:id', {
    open(ws) {
      const playerId = ws.data.query.playerId as string
      if (!playerId) {
        ws.close()
        return
      }

      const { id: gameId } = ws.data.params as { id: string }
      const game = games.get(gameId)
      if (!game) {
        ws.close()
        return
      }

      if (!game.players.has(playerId)) {
        const newPlayer = createNewPlayer(playerId)
        game.players.set(playerId, newPlayer)
      }

      ws.subscribe(gameId)
      ws.send({
        type: 'on-join',
        playerId,
        state: {
          players: Array.from(game.players.values()).filter((p) => p.playerId !== playerId)
        }
      })
      ws.publish(gameId, {
        type: 'player-joined',
        playerId,
        state: game.players.get(playerId)
      })
    },

    message(ws, message) {
      const { id: gameId } = ws.data.params as { id: string }
      const data = message as any
      const game = games.get(gameId)
      if (!game) return

      if (data.type === 'player-update') {
        const player = game.players.get(data.playerId)
        if (player) {
          player.x = data.state.x
          player.y = data.state.y
          player.scale = data.state.scale
          player.color = data.state.color
          player.movement = data.state.movement
          player.movementSpeed = data.state.movementSpeed
          player.activeMessage = data.state.activeMessage
          player.isTyping = data.state.isTyping
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
    },

    close(ws, code, message) {
      const { id: gameId } = ws.data.params as { id: string }
      const playerId = ws.data.query.playerId as string
      console.log('connection closed', { code, message, gameId, playerId })
      const game = games.get(gameId)
      if (game) {
        if (game.players.has(playerId)) {
          game.players.delete(playerId)
        }
      }
      ws.unsubscribe(gameId)
    }
  })

  .listen(3000)
