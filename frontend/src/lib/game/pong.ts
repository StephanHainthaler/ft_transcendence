import { AppUser} from "../api/appUser";
import { Player } from "./player";
import { Ball } from "./ball";
import { get } from "svelte/store";
import { t } from "../../lib/i18n/i18n";
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
	private _maxPlayerScore: number = 5;
	private _maxMatchDuration: number = 300000; // 5 min in ms
	private _preMatchDuration: number = 3000; // 3 seconds in ms
	private _currentMatchDuration: number = 0;
	private _matchStartTime: number = 0;
	private _pauseStartTime: number = 0;
	private _pauseDuration: number = 0;
	private _lastFrameTime: number = 0;
	private _isPaused: boolean = true;

	private _mousedownEventListener! : EventListener;
	private _keydownEventListener!: EventListener;
	private _keyupEventListener!: EventListener;
	private _blurEventListener!: EventListener;
	private _resizeEventListener!: EventListener;
	private _onGameEnd: (Data: MatchSubmissionData) => void;

	public	constructor(player1: AppUser, player2: AppUser, canvas: HTMLCanvasElement, pointsToWin: number, matchDurationInMinutes: number, AIdifficulty: number, _onGameEnd:(Data: MatchSubmissionData) => void)
	{
		// initialize canvas and context and set match parameters
		this._canvas = canvas;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._maxPlayerScore = pointsToWin;
		this._maxMatchDuration = matchDurationInMinutes * 60000 + this._preMatchDuration;
		this._onGameEnd = _onGameEnd;
		this.resizeCanvas();
		this.setupEvents();

		// initialize players and ball
		this._player1 = new Player(this, player1, 1, this._canvas.width * 0.1, this._canvas.height * 0.445, AIdifficulty);
		this._player2 = new Player(this, player2, 2, this._canvas.width * 0.9, this._canvas.height * 0.445, AIdifficulty);
		this._ball = new Ball(this, this._player1, this._player2);

		// set match timer
		this._matchStartTime = new Date().getTime();

		// start frame requesting loop
		this._isPaused = false;
		window.requestAnimationFrame((time) => this.updatePong(time));
	}

	public	setupEvents() : void
	{
		// event for clicking on the canvas
		this._mousedownEventListener = () => this._canvas.focus();

		// event for holding the key
		this._keydownEventListener = (event: Event) =>
		{
			const e = event as KeyboardEvent;
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
			
			const k = e.key;
			if (k === 'Escape') this.changeGameState();
			else if (this._isPaused == true) return ;
			else if (k.toLowerCase() === 'w') this._player1.startMoveUp();
			else if (k.toLowerCase() === 's') this._player1.startMoveDown();
			else if (k === 'ArrowUp') this._player2.startMoveUp();
			else if (k === 'ArrowDown') this._player2.startMoveDown();
		};

		// event for releasing the key
		this._keyupEventListener = (event: Event) =>
		{
			const e = event as KeyboardEvent;
			const k = e.key;
			if (this._isPaused == true) return ;
			else if (k.toLowerCase() === 'w') this._player1.stopMoveUp();
			else if (k.toLowerCase() === 's') this._player1.stopMoveDown();
			else if (k === 'ArrowUp') this._player2.stopMoveUp();
			else if (k === 'ArrowDown') this._player2.stopMoveDown();
		};

		// prevents movement from getting stuck when losing this._canvas focus
		this._blurEventListener = () =>
		{
			if (this._isPaused == true) return ;
			this._player1.stopMoveUp();
			this._player1.stopMoveDown();
			this._player2.stopMoveUp();
			this._player2.stopMoveDown();
		};

		// handle window resize
		this._resizeEventListener = () => this.handleResize();

		// add event listeners
		this._canvas.addEventListener('mousedown', this._mousedownEventListener);
		this._canvas.addEventListener('keydown', this._keydownEventListener);
		this._canvas.addEventListener('keyup', this._keyupEventListener);
		this._canvas.addEventListener('blur', this._blurEventListener);
		window.addEventListener('resize', this._resizeEventListener);
	}

	public	removeEvents(): void
	{
		// remove event listeners
		this._canvas.removeEventListener('mousedown', this._mousedownEventListener);
		this._canvas.removeEventListener('keydown', this._keydownEventListener);
		this._canvas.removeEventListener('keyup', this._keyupEventListener);
		this._canvas.removeEventListener('blur', this._blurEventListener);
		window.removeEventListener('resize', this._resizeEventListener);
	}

	public	updatePong = (currentTime: number = 0) =>
	{
		// get current match duration
		const now = new Date().getTime();
		if (this._isPaused == true)
			this._currentMatchDuration = now - this._matchStartTime - this._pauseDuration - (now - this._pauseStartTime);
		else
			this._currentMatchDuration = now - this._matchStartTime - this._pauseDuration;

		// check for match end conditions
		if (this._currentMatchDuration >= this._maxMatchDuration
			|| this._player1.getScore() >= this._maxPlayerScore
			|| this._player2.getScore() >= this._maxPlayerScore)
		{
			if (this._player1.getScore() != this._player2.getScore())
			{
				this._isPaused = true;
				this.removeEvents();
				const data = this.getMatchData();
				this._onGameEnd(data);
				return ;
			}
		}

		// calculate delta: how many "60fps frames" worth of time passed
		if (this._lastFrameTime === 0) 
			this._lastFrameTime = currentTime;
		const elapsed = currentTime - this._lastFrameTime;
		this._lastFrameTime = currentTime;

		// clamp to max 3 to prevent huge jumps after tab switch
		const delta = Math.min(elapsed / TARGET_FRAME_TIME, 3);

		// update entities and draw the game
		this.moveBall(delta);
		this.movePlayer(this._player1, delta);
		this.movePlayer(this._player2, delta);
		this.drawGame();

		// request next frame
		window.requestAnimationFrame((time) => this.updatePong(time));
	};

	private	resizeCanvas(): void
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

	private	handleResize(): void
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

	public	drawGame() : void
	{
		// clear canvas and set font and alignment
		const fontSize = Math.round(this._canvas.height * (60 / 720));
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._context.font = `${fontSize}px Arial`;
		this._context.textAlign = "center";
		
		// set color depending on the game state
		if (this._isPaused == true || this._currentMatchDuration < this._preMatchDuration)
			this._context.fillStyle = "rgb(170, 170, 170)";
		else
			this._context.fillStyle = "rgb(255, 255, 255)";

		// draw upper and lower borders
		this._context.fillRect(0, this._canvas.height * 0.1 - this._canvas.height * 0.01, this._canvas.width, this._canvas.height * 0.01);
		this._context.fillRect(0, this._canvas.height * 0.9, this._canvas.width, this._canvas.height * 0.01);

		// draw middle line
		for (let i = this._canvas.height * 0.1; i < this._canvas.height * 0.9; i += this._canvas.height * 0.03)
			this._context.fillRect(this._canvas.width * 0.5, i, this._canvas.width * 0.0025, this._canvas.height * 0.01);

		// draw player scores
		this._context.fillText(this._player1.getScore().toString(), this._canvas.width * 0.45, this._canvas.height * 0.075);
		this._context.fillText(this._player2.getScore().toString(), this._canvas.width * 0.55, this._canvas.height * 0.075);

		// draw player paddles and ball
		this._context.fillRect(this._player1.getOrigin().x, this._player1.getOrigin().y, this._player1.getWidth(), this._player1.getHeight());
		this._context.fillRect(this._player2.getOrigin().x - this._player2.getWidth(), this._player2.getOrigin().y, this._player2.getWidth(), this._player2.getHeight());
		this._context.fillRect(this._ball.getOrigin().x, this._ball.getOrigin().y, this._ball.getWidth(), this._ball.getHeight());

		// draw match timer
		let currentCountdown;
		if (this._currentMatchDuration < this._preMatchDuration)
			currentCountdown = Math.ceil((this._preMatchDuration - this._currentMatchDuration) / 1000);
		else
			currentCountdown = Math.ceil((this._maxMatchDuration - this._currentMatchDuration) / 1000);
		if (currentCountdown < 10)
		{
			if (this._isPaused == true)
				this._context.fillStyle = "rgb(167, 3, 3)";
			else
				this._context.fillStyle = "rgb(255, 0, 0)";
		}
		if (currentCountdown < 0)
			this._context.fillText(get(t)('game.overtime'), this._canvas.width * 0.5, this._canvas.height * 0.985);
		else
			this._context.fillText(currentCountdown.toString(), this._canvas.width * 0.5, this._canvas.height * 0.985)

		// draw pause screen if paused
		if (this._isPaused == true)
		{
			this._context.fillStyle = "rgb(255, 255, 255)";
			this._context.fillText(get(t)('game.paused'), this._canvas.width * 0.5, this._canvas.height * 0.5);
		}
	}

	public	changeGameState() : void
	{
		if (this._isPaused == false)
			this._pauseStartTime = new Date().getTime();
		else
			this._pauseDuration = new Date().getTime() - this._pauseStartTime + this._pauseDuration;
		this._isPaused = !this._isPaused;
	}

	public	moveBall(delta: number): void
	{
		if (this._isPaused == true || this._currentMatchDuration < this._preMatchDuration)
			return ;
		this._ball.move(this._player1, this._player2, delta);
	}

	public	movePlayer(player: Player, delta: number)
	{
		if (this._isPaused == true || this._currentMatchDuration < this._preMatchDuration)
			return ;
		if (player.isAI() == false)
			player.move(delta);
		else
			player.moveByAI(this._ball, delta);
	}

	public	getMatchData(): MatchSubmissionData
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
		matchData.duration = new Date().getTime() - this._matchStartTime - this._pauseDuration - this._preMatchDuration;
		matchData.timestamp = this._matchStartTime;
		return (matchData);
	}

	public	resetMatch(canvas: HTMLCanvasElement) : void
	{
		// reinitialize canvas and context
		this._canvas = canvas;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this.resizeCanvas();
		this.setupEvents();

		// reset players and ball
		this._player1.setScore(0);
		this._player2.setScore(0);
		this._player1.setOrigin({x: this._canvas.width * 0.1, y: this._canvas.height * 0.445});
		this._player2.setOrigin({x: this._canvas.width * 0.9, y: this._canvas.height * 0.445});
		this._player1.stopMoveUp(), this._player1.stopMoveDown();
		this._player2.stopMoveUp(), this._player2.stopMoveDown();
		this._ball.spawnBall(this._canvas.width * 0.5, this._canvas.height * 0.5, this._player1, this._player2);

		// reset match timers
		this._currentMatchDuration = 0;
		this._pauseDuration = 0;
		this._pauseStartTime = 0;
		this._lastFrameTime = 0;
		this._matchStartTime = new Date().getTime();

		// restart loop
		this._isPaused = false;
		window.requestAnimationFrame((time) => this.updatePong(time));
	}

	public	getCanvas() : HTMLCanvasElement
	{
		return (this._canvas);
	}

	public	getScale(): number
	{
		return (this._canvas.width / this._baseWidth);
	}
}
