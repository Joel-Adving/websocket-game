export function createNewPlayer(playerId: string) {
  return {
    playerId,
    x: 200,
    y: 200,
    color: 'black',
    scale: 3,
    activeMessage: '',
    movementSpeed: 10,
    isTyping: false,
    movement: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }
}
