//Code for PONG

type vector = {x: number; y: number};

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

	public constructor(player1_name: string, player2_name: string)
	{
		this._canvas = document.getElementById("canvas") as HTMLCanvasElement;
		// this._canvas.width = window.innerWidth * 0.66;
		// this._canvas.height = window.innerHeight * 0.66;
		this._canvas.width = screen.width * 0.66;
		this._canvas.height = screen.height * 0.66;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;

		this._player1 = new Player(player1_name, this._canvas.width * 0.1, this._canvas.height * 0.5, this._canvas);
		this._player2 = new Player(player2_name, this._canvas.width * 0.9, this._canvas.height * 0.5, this._canvas);
		this._ball = new Ball(this._canvas);
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
	private	_name: string;
	//private _color: Console._color;
	private	_velocity: number;
	private	_width: number;
	private	_height: number;
	private	_button_up: number;
	private	_button_down: number;
	private	_origin: vector;
	private	_score: number;

	public constructor(name: string, x: number, y: number, canvas: HTMLCanvasElement)
	{
		this._origin = {x, y};
    	this._name = name;
		this._velocity = 1;
		this._width = canvas.width * 0.004;
		this._height = canvas.height * 0.12;
		this._button_up = 119;
		this._button_down = 115;
		this._score = 0;
	}

	public move(): void
	{
		if ((this._origin.y + this._height) + this._velocity > (game.getCanvas().height * 0.9) || this._origin.y + this._velocity < game.getCanvas().height * 0.1)
		{
			this._velocity = -this._velocity;
			//return ;
		} 
		this._origin.y += this._velocity;
	}

	public moveByAI(): void
	{

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
	private	_origin: vector;
	private _direction: vector;
	private _hasStartingSpeed: boolean;

	public constructor(canvas: HTMLCanvasElement)
	{
		this._width = canvas.width * 0.01;
		this._height = this._width;
		this._velocity = 2;
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

	public move(player1: Player, player2: Player): void
	{
		//ball hits left screen end
		if (this._origin.x + this._direction.x < 0)
		{
			player2.setScore(player2.getScore() + 1);
			this.spawnBall(game.getCanvas().width * 0.5, game.getCanvas().height * 0.5);
		}

		//ball hits right screen end
		if (this._origin.x + this._direction.x > (game.getCanvas().width))
		{
			player1.setScore(player1.getScore() + 1);
			this.spawnBall(game.getCanvas().width * 0.5, game.getCanvas().height * 0.5);
		}

		//ball hits left or right player paddle
		if ((this._origin.x + this._direction.x < player1.getOrigin().x + player1.getWidth() && this.isHittingPlayer(player1) == true) ||
			(this._origin.x + this._width + this._direction.x > player2.getOrigin().x && this.isHittingPlayer(player2) == true))
			this._direction.x = -this._direction.x;
		this._origin.x += this._direction.x;

		//ball hits upper or lower wall
		if ((this._origin.y + this._height) + this._direction.y > (game.getCanvas().height * 0.9) || this._origin.y + this._direction.y < game.getCanvas().height * 0.1)
			this._direction.y = -this._direction.y;
		this._origin.y += this._direction.y;
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

const updatePong = () => {

	game.getBall().move(game.getPlayer(1), game.getPlayer(2));
	game.getPlayer(1).move();
	game.getPlayer(2).move();
	game.draw_arena();
  	window.requestAnimationFrame(() => updatePong());
};

window.requestAnimationFrame(() => updatePong());
