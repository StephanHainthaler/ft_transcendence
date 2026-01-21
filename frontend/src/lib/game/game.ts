import { Pong } from "./pong";

let canvas: HTMLCanvasElement;
let game: Pong;

canvas = document.getElementById("pong-game-canvas") as HTMLCanvasElement;
game = new Pong("Stephan", "Julian", canvas);

//set-up function all beow

canvas.tabIndex = 0;
canvas.addEventListener('mousedown', () => canvas.focus());

// Keyboard listeners: W/S for player 1, ArrowUp/ArrowDown for player 2
canvas.addEventListener('keydown', (e: KeyboardEvent) =>
{
	if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
	const k = e.key;
	if (k.toLowerCase() === 'w') game.getPlayer(1).startMoveUp();
	else if (k.toLowerCase() === 's') game.getPlayer(1).startMoveDown();
	else if (k === 'ArrowUp') game.getPlayer(2).startMoveUp();
	else if (k === 'ArrowDown') game.getPlayer(2).startMoveDown();
});

canvas.addEventListener('keyup', (e: KeyboardEvent) =>
{
	const k = e.key;
	if (k.toLowerCase() === 'w') game.getPlayer(1).stopMoveUp();
	else if (k.toLowerCase() === 's') game.getPlayer(1).stopMoveDown();
	else if (k === 'ArrowUp') game.getPlayer(2).stopMoveUp();
	else if (k === 'ArrowDown') game.getPlayer(2).stopMoveDown();
});

// prevents movement from getting stuck when losing canvas focus
canvas.addEventListener('blur', () =>
{
	game.getPlayer(1).stopMoveUp();
	game.getPlayer(1).stopMoveDown();
	game.getPlayer(2).stopMoveUp();
	game.getPlayer(2).stopMoveDown();
	game.getPlayer(1).stopMoveUp();
	game.getPlayer(1).stopMoveDown();
	game.getPlayer(2).stopMoveUp();
	game.getPlayer(2).stopMoveDown();
});

window.requestAnimationFrame((time) => game.updatePong(time));
