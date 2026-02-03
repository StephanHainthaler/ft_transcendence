import { Pong } from "./pong";
import { Ball } from "./ball";
import { AppUser} from "../api/appUser";

type vector = {x: number; y: number};

export class Player
{
	private	_game: Pong;
	private _data: AppUser
	private _playerNumber: number;
	private	_width: number;
	private	_height: number;
	private	_origin: vector;
	private	_velocity: number;
	private	_score: number;
	private _isAI: boolean;
	private _onHitCoolDown: boolean;
	private	_movingUp: boolean;
	private	_movingDown: boolean;

	public constructor(game: Pong, data: AppUser, playerNumber: number, x: number, y: number)
	{
		this._game = game;
		this._data = data;
		this._playerNumber = playerNumber;
		this._width = game.getCanvas().width * 0.01;
		this._height = game.getCanvas().height * 0.12;
		this._origin = {x, y};
		this._velocity = 5;
		this._score = 0;
		if (this._data.id === 0)
			this._isAI = true;
		else
			this._isAI = false;
		this._onHitCoolDown = false;
		this._movingUp = false;
		this._movingDown = false;
	}

	public startMoveUp(): void{ this._movingUp = true; }
	public startMoveDown(): void { this._movingDown = true; }
	public stopMoveUp(): void { this._movingUp = false; }
	public stopMoveDown(): void { this._movingDown = false; }

	public move(delta: number): void
	{
		const canvas = this._game.getCanvas();
		const scale = this._game.getScale();
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

	public moveByAI(ball: Ball, delta: number): void
	{
		const scale = this._game.getScale();
		const scaledVelocity = this._velocity * scale * delta;

		// if the ball is in opponents field, go to the middle
		if (ball.getOrigin().x < (this._game.getCanvas().width / 2))
		{
			if (this._origin.y < this._game.getCanvas().height / 2)
				this._origin.y += scaledVelocity;
			else if (this._origin.y > this._game.getCanvas().height / 2)
				this._origin.y -= scaledVelocity;
		}
		else if (ball.getOrigin().y - ball.getHeight() > this._origin.y && (this._origin.y + this._height) + scaledVelocity < (this._game.getCanvas().height * 0.9))
			this._origin.y += scaledVelocity;
		else if (ball.getOrigin().y <= this._origin.y && this._origin.y - scaledVelocity > this._game.getCanvas().height * 0.1)
			this._origin.y -= scaledVelocity;
	}

	public updateForResize(canvas: HTMLCanvasElement, relativeY: number): void
	{
		this._origin.y = relativeY * canvas.height;
		this._width = canvas.width * 0.004;
		this._height = canvas.height * 0.12;
		this._origin.x = this._playerNumber === 1 ? canvas.width * 0.1 : canvas.width * 0.9;
	}

	public getData(): AppUser
	{
    	return (this._data);
	}

	public getOrigin(): vector
	{
    	return (this._origin);
	}

	public setOrigin(newOrigin: vector): void
	{
    	this._origin = newOrigin;
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

	public setScore(score: number)
	{
		this._score = score; 
	}

	public getHitCooldownState(): boolean
	{
		return (this._onHitCoolDown);
	}

	public setHitCooldownState(newState: boolean): void
	{
		this._onHitCoolDown = newState;
	}

	public isAI()
	{
		return (this._isAI);
	}
}