//Code for PONG

type vector = {x: number; y: number};

const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms
let lastFrameTime = 0;

const getRandomNumber = (min: number, max: number) => {
  return (Math.random() * (max - min) + min);
}

class Pong
{
	private _canvas: HTMLCanvasElement;
	private _context: CanvasRenderingContext2D;
	private _player1: Player;
	private _player2: Player;
	private _ball: Ball;
	private _baseWidth: number = 1280;
	private _baseHeight: number = 720;

	public constructor(player1_name: string, player2_name: string)
	{
		this._canvas = document.getElementById("canvas") as HTMLCanvasElement;
		this.resizeCanvas();
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;

		this._player1 = new Player(player1_name, this._canvas.width * 0.1, this._canvas.height * 0.5, this._canvas, 1);
		this._player2 = new Player(player2_name, this._canvas.width * 0.9, this._canvas.height * 0.5, this._canvas, 2);
		this._ball = new Ball(this._canvas);

		// handle window resize
		window.addEventListener('resize', () => this.handleResize());
	}

	private resizeCanvas(): void
	{
		const aspectRatio = this._baseWidth / this._baseHeight;
		let width = window.innerWidth * 0.9;
		let height = width / aspectRatio;

		if (height > window.innerHeight * 0.8)
		{
			height = window.innerHeight * 0.8;
			width = height * aspectRatio;
		}

		this._canvas.width = width;
		this._canvas.height = height;
	}

	private handleResize(): void
	{
		const oldWidth = this._canvas.width;
		const oldHeight = this._canvas.height;

		// store relative Y positions
		const p1RelY = this._player1.getOrigin().y / oldHeight;
		const p2RelY = this._player2.getOrigin().y / oldHeight;
		const ballRelX = this._ball.getOrigin().x / oldWidth;
		const ballRelY = this._ball.getOrigin().y / oldHeight;

		this.resizeCanvas();

		// update positions based on new canvas size
		this._player1.updateForResize(this._canvas, p1RelY);
		this._player2.updateForResize(this._canvas, p2RelY);
		this._ball.updateForResize(this._canvas, ballRelX, ballRelY);
	}

	public getScale(): number
	{
		return (this._canvas.width / this._baseWidth);
	}

	public draw_arena()
	{
		//clear canvas
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

		//set color to white
		this._context.fillStyle = "#ffffffff";

		//draw upper and lower borders To Do set the borders accordingly to collisions zone
		this._context.fillRect(0, this._canvas.height * 0.1 - this._canvas.height * 0.01, this._canvas.width, this._canvas.height * 0.01);
		this._context.fillRect(0, this._canvas.height * 0.9, this._canvas.width, this._canvas.height * 0.01);

		//draw middle line
		for (let i = this._canvas.height * 0.1; i < this._canvas.height * 0.9; i += this._canvas.height * 0.03)
			this._context.fillRect(this._canvas.width * 0.5, i, this._canvas.width * 0.005, this._canvas.height * 0.01);

		//draw player scores
		this.drawPlayerScore(this._player1.getScore(), this._canvas.width * 0.45, this._canvas.height * 0.01);
		this.drawPlayerScore(this._player2.getScore(), this._canvas.width * 0.535, this._canvas.height * 0.01);

		//draw player paddles
		this._context.fillRect(this._player1.getOrigin().x, this._player1.getOrigin().y, this._player1.getWidth(), this._player1.getHeight());
		this._context.fillRect(this._player2.getOrigin().x, this._player2.getOrigin().y, this._player2.getWidth(), this._player2.getHeight());

		//draw ball
		this._context.fillStyle = "#ff0000ff";
		this._context.fillRect(this._ball.getOrigin().x, this._ball.getOrigin().y, this._ball.getWidth(), this._ball.getHeight());

	}

	public drawPlayerScore(score: number, x: number, y: number)
	{
		let number_width = this._canvas.width * 0.02;
		let number_height = this._canvas.height * 0.065;
		
		switch (score)
		{
			case 0:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				this._context.fillRect(x, y, this._canvas.height * 0.005, number_height);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				break;
			case 1:
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				break;
			case 2:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y + number_height * 0.5, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				break;
			case 3:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				break;
			case 4:
				this._context.fillRect(x, y, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				break;
			case 5:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y + number_height * 0.5, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				break;
			case 6:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y, this._canvas.height * 0.005, number_height);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y + number_height * 0.5, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				break;
			case 7:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				break;
			case 8:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				this._context.fillRect(x, y, this._canvas.height * 0.005, number_height);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				break;
			case 9:
				this._context.fillRect(x, y, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x + number_width, y, this._canvas.height * 0.005, number_height);
				this._context.fillRect(x, y, this._canvas.height * 0.005, number_height * 0.5);
				this._context.fillRect(x, y + number_height, number_width, this._canvas.height * 0.005);
				this._context.fillRect(x, y + number_height * 0.5, number_width, this._canvas.height * 0.005);
				break;
			default:
				return ;
		}
	}

	public getCanvas() : HTMLCanvasElement
	{
		return (this._canvas);
	}

	public getPlayer(player_number: number) : Player
	{
		if (player_number == 1)
			return (this._player1);
		else
			return (this._player2);
	}

	public getBall() : Ball
	{
		return (this._ball);
	}
}

class Player
{
	private _name: string;
	private _playerNumber: number;
	private	_velocity: number;
	private	_width: number;
	private	_height: number;
	private	_origin: vector;
	private	_score: number;
	private	_movingUp: boolean;
	private	_movingDown: boolean;


	public constructor(name: string, x: number, y: number, canvas: HTMLCanvasElement, playerNumber: number)
	{
		this._origin = {x, y};
    	this._name = name;
		this._playerNumber = playerNumber;
		this._velocity = 3;
		this._width = canvas.width * 0.004;
		this._height = canvas.height * 0.12;
		this._score = 0;
		this._movingUp = false;
		this._movingDown = false;
	}

	public move(delta: number): void
	{
		const canvas = game.getCanvas();
		const scale = game.getScale();
		const scaledVelocity = this._velocity * scale * delta;

		if (this._movingUp && !this._movingDown)
		{
			const newY = this._origin.y - scaledVelocity;
			this._origin.y = Math.max(newY, canvas.height * 0.1);
			return;
		}
		if (this._movingDown && !this._movingUp)
		{
			const newY = this._origin.y + scaledVelocity;
			this._origin.y = Math.min(newY, canvas.height * 0.9 - this._height);
			return;
		}
	}

	public updateForResize(canvas: HTMLCanvasElement, relativeY: number): void
	{
		this._origin.y = relativeY * canvas.height;
		this._width = canvas.width * 0.004;
		this._height = canvas.height * 0.12;
		this._origin.x = this._playerNumber === 1 ? canvas.width * 0.1 : canvas.width * 0.9;
	}

	public startMoveUp(): void { this._movingUp = true; }
	public startMoveDown(): void { this._movingDown = true; }
	public stopMoveUp(): void { this._movingUp = false; }
	public stopMoveDown(): void { this._movingDown = false; }

	public moveByAI(ball: Ball, delta: number): void
	{
		const scale = game.getScale();
		const scaledVelocity = this._velocity * scale * delta;

		// if the ball is in opponents field, go to the middle
		if (ball.getOrigin().x < (game.getCanvas().width / 2))
		{
			if (this._origin.y < game.getCanvas().height / 2)
				this._origin.y += scaledVelocity;
			else if (this._origin.y > game.getCanvas().height / 2)
				this._origin.y -= scaledVelocity;
		}
		else if (ball.getOrigin().y - ball.getHeight() > this._origin.y && (this._origin.y + this._height) + scaledVelocity < (game.getCanvas().height * 0.9))
			this._origin.y += scaledVelocity;
		else if (ball.getOrigin().y <= this._origin.y && this._origin.y - scaledVelocity > game.getCanvas().height * 0.1)
			this._origin.y -= scaledVelocity;
	}

	public setName(name: string): void
	{
    	this._name = name;
	}

	public setScore(score: number)
	{
		if (score >= 10)
			score = 0;
		this._score = score; 
	}

	public getOrigin(): vector
	{
    	return (this._origin);
	}

	public getWidth(): number
	{
    	return (this._width);
	}

	public getHeight(): number
	{
    	return (this._height);
	}

	public getScore(): number
	{
    	return (this._score);
	}
}

class Ball
{
	private	_width: number;
	private	_height: number;
	private	_velocity: number;
	private	_origin!: vector;
	private _direction!: vector;
	private _hasStartingSpeed!: boolean;

	public constructor(canvas: HTMLCanvasElement)
	{
		this._width = canvas.width * 0.01;
		this._height = this._width;
		this._velocity = 3;
		this.spawnBall(canvas.width * 0.5, canvas.height * 0.5);
	}

	public spawnBall(spawnArea_x: number, spawnArea_y: number) : void
	{
		this._origin = this.getRandomStartingPoint(spawnArea_x, spawnArea_y);
		this._direction = this.getRandomStartingDirection();
		this._hasStartingSpeed = true;
	}

	public getRandomStartingPoint(centerWidth: number, centerHeight: number): vector
	{
		let x, y: number;

		x = centerWidth - (this._width * 0.25);
		y = getRandomNumber(centerHeight * 0.95, centerHeight * 1.05);
		return ({x, y});
	}

	public getRandomStartingDirection(): vector
	{
		let x, y: number;

		//gets you a number between -1 and 1
		if (Math.random() * 2 - 1 < 0)
			x = -1
		else
			x = 1;
		y = getRandomNumber(0, 0.34);
		if (Math.random() * 2 - 1 < 0)
			y *= -1;
		x *= this._velocity;
		y *= this._velocity;
		return ({x, y});
	}

	public move(player1: Player, player2: Player, delta: number): void
	{
		const scale = game.getScale();
		const moveX = this._direction.x * scale * delta;
		const moveY = this._direction.y * scale * delta;

		//ball hits left screen end
		if (this._origin.x + moveX < 0)
		{
			player2.setScore(player2.getScore() + 1);
			this.spawnBall(game.getCanvas().width * 0.5, game.getCanvas().height * 0.5);
			return;
		}

		//ball hits right screen end
		if (this._origin.x + moveX > (game.getCanvas().width))
		{
			player1.setScore(player1.getScore() + 1);
			this.spawnBall(game.getCanvas().width * 0.5, game.getCanvas().height * 0.5);
			return;
		}

		//ball hits left or right player paddle
		if ((this._origin.x + moveX < player1.getOrigin().x + player1.getWidth() && this.isHittingPlayer(player1) == true) ||
			(this._origin.x + this._width + moveX > player2.getOrigin().x && this.isHittingPlayer(player2) == true))
			this._direction.x = -this._direction.x;
		this._origin.x += this._direction.x * scale * delta;

		//ball hits upper or lower wall
		if ((this._origin.y + this._height) + moveY > (game.getCanvas().height * 0.9) || this._origin.y + moveY < game.getCanvas().height * 0.1)
			this._direction.y = -this._direction.y;
		this._origin.y += this._direction.y * scale * delta;
	}

	public updateForResize(canvas: HTMLCanvasElement, relativeX: number, relativeY: number): void
	{
		this._origin.x = relativeX * canvas.width;
		this._origin.y = relativeY * canvas.height;
		this._width = canvas.width * 0.01;
		this._height = this._width;
	}

	public isHittingPlayer(player: Player): boolean
	{
		if (this._origin.y >= player.getOrigin().y && this._origin.y + this._height <= player.getOrigin().y + player.getHeight())
		{
			if (this._hasStartingSpeed == true)
			{
				this._direction.x *= 2;
				this._direction.y *= 2;
				this._hasStartingSpeed = false;
			}
			return (true);
		}
		return (false);
	}

	public getWidth(): number
	{
    	return (this._width);
	}

	public getHeight(): number
	{
    	return (this._height);
	}

	public getOrigin(): vector
	{
		return (this._origin);
	}

	public getDirection(): vector
	{
		return (this._direction);
	}
}

let game: Pong;
game = new Pong("Stephan", "Julian");

const canvas = game.getCanvas();
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
});

const updatePong = (currentTime: number) => {
	// calculate delta: how many "60fps frames" worth of time passed
	if (lastFrameTime === 0) lastFrameTime = currentTime;
	const elapsed = currentTime - lastFrameTime;
	lastFrameTime = currentTime;

	// clamp to max 3 to prevent huge jumps after tab switch
	const delta = Math.min(elapsed / TARGET_FRAME_TIME, 3);

	game.getBall().move(game.getPlayer(1), game.getPlayer(2), delta);
	game.getPlayer(1).move(delta);
	const p2 = game.getPlayer(2);
	//if (2 player mode)
		p2.move(delta);
	//else
		//p2.moveByAI(game.getBall(), delta);
	game.draw_arena();
	window.requestAnimationFrame(updatePong);
};

window.requestAnimationFrame(updatePong);