export type Game = {
  id: string
  players: Map<string, Player>
}

export type Player = {
  playerId: string
  x: number
  y: number
  color: string
  scale: number
  movementSpeed: number
  movement: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
  }
}
