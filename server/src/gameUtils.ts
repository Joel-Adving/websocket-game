export function createNewPlayer(playerId: string) {
  return {
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
  }
}
