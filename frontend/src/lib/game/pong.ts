import { AppUser} from "../api/appUser";
import { Player } from "./player";
import { Ball } from "./ball";
import type { MatchSubmissionData } from '@shared/game_stats';

const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms

export class Pong
{
	private _canvas: HTMLCanvasElement;
	private _context: CanvasRenderingContext2D;
	private _baseWidth: number = 1280;
	private _baseHeight: number = 720;
	private _player1: Player;
	private _player2: Player;
	private _ball: Ball;
	private _onGameEnd: (Data: MatchSubmissionData) => void;
	private _matchStartTime: number = 0;
	private _pauseStartTime: number = 0;
	private _pauseDuration: number = 0;
	private _isPaused: boolean = true;
	private _lastFrameTime: number = 0;

	public constructor(player1: AppUser, player2: AppUser, canvas: HTMLCanvasElement, _onGameEnd:(Data: MatchSubmissionData) => void)
	{
		this._canvas = canvas;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this.resizeCanvas();

		this._player1 = new Player(this, player1, 1, this._canvas.width * 0.1, this._canvas.height * 0.5, false);
		this._player2 = new Player(this, player2, 2, this._canvas.width * 0.9, this._canvas.height * 0.5, true);
		this._ball = new Ball(this, this._player1, this._player2);
		this._onGameEnd = _onGameEnd;
	
		this.setupEvents();
		this._matchStartTime = new Date().getTime();
		this._isPaused = false;
	}

	public setupEvents() : void
	{
		//this._canvas.tabIndex = 0; // <-- should already been done in svelte.page (game)
		this._canvas.addEventListener('mousedown', () => this._canvas.focus());

		// Keyboard listeners: W/S for player 1, ArrowUp/ArrowDown for player 2
		this._canvas.addEventListener('keydown', (e: KeyboardEvent) =>
		{
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
			
			const k = e.key;
			if (k === 'Escape') this.changeGameState();
			else if (this._isPaused == true) return ;
			else if (k.toLowerCase() === 'w') this._player1.startMoveUp();
			else if (k.toLowerCase() === 's') this._player1.startMoveDown();
			else if (k === 'ArrowUp') this._player2.startMoveUp();
			else if (k === 'ArrowDown') this._player2.startMoveDown();
		});

		this._canvas.addEventListener('keyup', (e: KeyboardEvent) =>
		{
			const k = e.key;
			if (this._isPaused == true) return ;
			else if (k.toLowerCase() === 'w') this._player1.stopMoveUp();
			else if (k.toLowerCase() === 's') this._player1.stopMoveDown();
			else if (k === 'ArrowUp') this._player2.stopMoveUp();
			else if (k === 'ArrowDown') this._player2.stopMoveDown();
		});

		// prevents movement from getting stuck when losing this._canvas focus
		this._canvas.addEventListener('blur', () =>
		{
			if (this._isPaused == true) return ;
			this._player1.stopMoveUp();
			this._player1.stopMoveDown();
			this._player2.stopMoveUp();
			this._player2.stopMoveDown();
		});

		// handle window resize
		window.addEventListener('resize', () => this.handleResize());

		window.requestAnimationFrame((time) => this.updatePong(time));
	}

	public updatePong = (currentTime: number = 0) => {

		//check time/score END CONDITIONS
		if (this._player1.getScore() > 9 || this._player2.getScore() > 9)
		{
			const data = this.submitMatchData();
			this._onGameEnd(data);
			return ;
		}

		// calculate delta: how many "60fps frames" worth of time passed
		if (this._lastFrameTime === 0) 
			this._lastFrameTime = currentTime;
		const elapsed = currentTime - this._lastFrameTime;
		this._lastFrameTime = currentTime;

		// clamp to max 3 to prevent huge jumps after tab switch
		const delta = Math.min(elapsed / TARGET_FRAME_TIME, 3);

		this.moveBall(delta); 
		this.movePlayer(this._player1, delta);
		this.movePlayer(this._player2, delta);
		this.drawArena();

		window.requestAnimationFrame((time) => this.updatePong(time));
	};

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

	public drawArena() : void
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

	public changeGameState() : void
	{
		if (this._isPaused == false)
			this._pauseStartTime = new Date().getTime();
		else
			this._pauseDuration = new Date().getTime() - this._pauseStartTime + this._pauseDuration;
		this._isPaused = !this._isPaused;
	}

	public moveBall(delta: number): void
	{
		if (this._isPaused == true)
			return ;
		this._ball.move(this._player1, this._player2, delta);
	}

	public movePlayer(player: Player, delta: number)
	{
		if (this._isPaused == true)
			return ;
		if (player.isAI() == false)
			player.move(delta);
		else
			player.moveByAI(this._ball, delta);
	}

	public submitMatchData(): MatchSubmissionData
	{
		const matchData = {} as MatchSubmissionData;

		matchData.player_one_id = this._player1.getData().id;
		matchData.player_two_id = this._player2.getData().id;
		matchData.p1_score = this._player1.getScore();
		matchData.p2_score = this._player2.getScore();
		if (this._player1.getScore() > this._player2.getScore())
			matchData.winner_id = matchData.player_one_id;
		else
			matchData.winner_id = matchData.player_two_id;
		matchData.duration = new Date().getTime() - this._matchStartTime - this._pauseDuration;
		//matchData.matchStartTime = this._matchStartTime;
		return (matchData);
	}

	public getCanvas() : HTMLCanvasElement
	{
		return (this._canvas);
	}

	public getScale(): number
	{
		return (this._canvas.width / this._baseWidth);
	}
}
