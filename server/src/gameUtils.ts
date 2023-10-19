export function createNewPlayer(playerId: string) {
  return {
    playerId,
    x: 200,
    y: 200,
    color: 'black',
    scale: 3,
    movementSpeed: 10,
    movement: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }
}
