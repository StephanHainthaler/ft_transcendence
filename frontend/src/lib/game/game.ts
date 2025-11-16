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
		this._canvas.width = window.innerWidth * 0.66;
		this._canvas.height = window.innerHeight * 0.66;
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
		{
			this._context.fillRect(this._canvas.width * 0.5, i, this._canvas.width * 0.005, this._canvas.height * 0.01);
		}

		// to do: draw point score

		//draw player paddles
		this._context.fillRect(this._player1.getOrigin().x, this._player1.getOrigin().y, this._player1.getWidth(), this._player1.getHeight());
		this._context.fillRect(this._player2.getOrigin().x, this._player2.getOrigin().y, this._player2.getWidth(), this._player2.getHeight());

		//draw ball
		this._context.fillStyle = "#ff0000ff";
		this._context.fillRect(this._ball.getOrigin().x, this._ball.getOrigin().y, this._ball.getWidth(), this._ball.getHeight());

		this._context.beginPath();
		this._context.lineWidth = 3;
		this._context.moveTo(game._ball.getOrigin().x, game._ball.getOrigin().y);

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
	//score

	public constructor(name: string, x: number, y: number, canvas: HTMLCanvasElement)
	{
		this._origin = {x, y};
    	this._name = name;
		this._velocity = 6;
		this._width = canvas.width * 0.004;
		this._height = canvas.height * 0.12;
		this._button_up = 119;
		this._button_down = 115;
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

	public moveByAI(ball: Ball): void
	{
		// if the ball is in opponents field, go to the middle
		let gamer_point: number;
	
		// if ball velocity = + = down => choose this._origin.y  + this._height as comp
		if (ball.getDirection().y > 0) // ball heading downwards
			gamer_point = this._origin.y + this._height;
		else // ball heading upwards
			gamer_point = this._origin.y;

		if (ball.getOrigin().x < (game.getCanvas().width / 2))
		{
			if (gamer_point < game.getCanvas().height / 2)
				this._origin.y += this._velocity;
			else if (gamer_point > game.getCanvas().height / 2)
				this._origin.y -= this._velocity;
		}
		else if (ball.getOrigin().y > gamer_point && (this._origin.y + this._height) + this._velocity < (game.getCanvas().height * 0.9))
		{
			this._origin.y += this._velocity;
		}
		else if (ball.getOrigin().y + ball.getHeight() <= (this._origin.y + this._height / 2) && this._origin.y - this._velocity > game.getCanvas().height * 0.1)
		{
			this._origin.y -= this._velocity;
		}
	}

	public setName(name: string): void
	{
    	this._name = name;
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
}

class Ball
{
	private	_width: number;
	private	_height: number;
	private	_velocity: number;
	private	_origin: vector;
	private _direction: vector;

	public constructor(canvas: HTMLCanvasElement)
	{
		this._width = canvas.width * 0.01;
		this._height = this._width;
		this._velocity = 5;
		this._origin = this.getRandomStartingPoint(canvas.width * 0.5, canvas.height * 0.5);
		this._direction = this.getRandomStartingDirection();
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
		x += this._velocity;
		y += this._velocity;
		return ({x, y});
	}

	public move(player1: Player, player2: Player): void
	{
		if (this._origin.x + this._direction.x > (game.getCanvas().width) || this._origin.x + this._direction.x < 0)
		{
			this._direction.x = -this._direction.x;
		} 
		this._origin.x += this._direction.x; //SCORE/spawn new ball

		if (this._origin.x + this._direction.x < player1.getOrigin().x + player1.getWidth() && this.isHittingPlayer(this, player1) == true)
		{
			this._direction.x = -this._direction.x;
		} 
		this._origin.x += this._direction.x;

		if ((this._origin.y + this._height) + this._direction.y > (game.getCanvas().height * 0.9) || this._origin.y + this._direction.y < game.getCanvas().height * 0.1)
		{
			this._direction.y = -this._direction.y;
		} 
		this._origin.y += this._direction.y;
	}

	public isHittingPlayer(ball: Ball, player: Player): boolean
	{
		//if (ball.)
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

const updateState = () => {

	game.getBall().move(game.getPlayer(1), game.getPlayer(2));
	game.getPlayer(1).move();
	game.getPlayer(2).moveByAI(game.getBall());
	game.draw_arena();
  	window.requestAnimationFrame(() => updateState());
};

window.requestAnimationFrame(() => updateState());
