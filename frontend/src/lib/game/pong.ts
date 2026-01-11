import { Player } from "./player";
import { Ball } from "./ball";

export class Pong
{
	private _canvas: HTMLCanvasElement;
	private _context: CanvasRenderingContext2D;
	private _player1: Player;
	private _player2: Player;
	private _ball: Ball;
	private _baseWidth: number = 1280;
	private _baseHeight: number = 720;

	public constructor(player1_name: string, player2_name: string, canvas: HTMLCanvasElement)
	{
		this._canvas = canvas;
		this.resizeCanvas();
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;

		this._player1 = new Player(player1_name, this._canvas.width * 0.1, this._canvas.height * 0.5, this._canvas, 1, this);
		this._player2 = new Player(player2_name, this._canvas.width * 0.9, this._canvas.height * 0.5, this._canvas, 2, this);
		this._ball = new Ball(this._canvas, this, this._player1, this._player2);

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

	public updatePong = () => {

	this.getBall().move(this.getPlayer(1), this.getPlayer(2));
	this.getPlayer(1).move();
	const p2 = this.getPlayer(2);
	//if (2 player mode)
		//p2.move();
	//else
		p2.moveByAI(this.getBall());
	this.draw_arena();
	window.requestAnimationFrame(() => this.updatePong());
	};

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
		this._context.fillRect(this._player2.getOrigin().x - this._player2.getWidth(), this._player2.getOrigin().y, this._player2.getWidth(), this._player2.getHeight());

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
