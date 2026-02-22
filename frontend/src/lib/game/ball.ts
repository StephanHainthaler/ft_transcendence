import { Pong } from "./pong";
import { Player } from "./player";

type vector = {x: number; y: number};

const getRandomNumber = (min: number, max: number) => {
  return (Math.random() * (max - min) + min);
}

export class Ball
{
	private _game: Pong;
	private	_width: number;
	private	_height: number;
	private	_origin!: vector;
	private _direction!: vector;
	private	_velocity: number = 6;
	private _hasStartingSpeed!: boolean;

	public constructor(game: Pong, player1: Player, player2: Player)
	{
		this._game = game;
		this._width = game.getCanvas().width * 0.01;
		this._height = this._width;
		this.spawnBall(game.getCanvas().width * 0.5, game.getCanvas().height * 0.5, player1, player2);
	}

	public spawnBall(spawnAreaX: number, spawnAreaY: number, player1: Player, player2: Player) : void
	{
		this._origin = this.getRandomStartingPoint(spawnAreaX, spawnAreaY);
		this._direction = this.getRandomStartingDirection();
		this._velocity = 6;
		this._hasStartingSpeed = true;
		if (this._direction.x < 0)
		{
			player1.setHitCooldownState(false);
			player2.setHitCooldownState(true);
		}
		else
		{
			player1.setHitCooldownState(true);
			player2.setHitCooldownState(false);
		}
	}

	public getRandomStartingPoint(centerWidth: number, centerHeight: number): vector
	{
		let x, y: number;

		x = centerWidth - (this._width * 0.5);
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
        const scale = this._game.getScale();
        const moveX = this._direction.x * scale * delta;
        const moveY = this._direction.y * scale * delta;

        //ball hits left screen end
        if (this._origin.x + moveX < 0)
        {
            player2.setScore(player2.getScore() + 1);
            this.spawnBall(this._game.getCanvas().width * 0.5, this._game.getCanvas().height * 0.5, player1, player2);
            return;
        }

        //ball hits right screen end
        if (this._origin.x + moveX > (this._game.getCanvas().width))
        {
            player1.setScore(player1.getScore() + 1);
            this.spawnBall(this._game.getCanvas().width * 0.5, this._game.getCanvas().height * 0.5, player1, player2);
            return;
        }

        //ball hits left or right player paddle
        if (this.isHittingPlayer1(player1) == true || this.isHittingPlayer2(player2) == true)
        {
            if (this._hasStartingSpeed == true)
            {
                this._direction.x *= 2.5;
                this._direction.y *= 2.5;
                this._hasStartingSpeed = false;
            }
            player1.setHitCooldownState(!player1.getHitCooldownState());
            player2.setHitCooldownState(!player2.getHitCooldownState());
            this._direction.x = -this._direction.x;
        }
        this._origin.x += this._direction.x * scale * delta;

        //ball hits upper or lower wall
        if ((this._origin.y + this._height) + moveY > (this._game.getCanvas().height * 0.9) || this._origin.y + moveY < this._game.getCanvas().height * 0.1)
            this._direction.y = -this._direction.y;
        this._origin.y += this._direction.y * scale * delta;
    }

	public isHittingPlayer1(player1: Player): boolean
	{
		if (player1.getHitCooldownState() == true)
			return (false);

		// ball is within boundaries of the player horizontally
		if (this._origin.x + this._direction.x <= player1.getOrigin().x + player1.getWidth() && this._origin.x + this._width + this._direction.x >= player1.getOrigin().x)
		{
			// ball is hitting left player on their right side
			if (this._origin.y + this._direction.y >= player1.getOrigin().y && this._origin.y + this._height + this._direction.y <= player1.getOrigin().y + player1.getHeight())
				return (this.calculateDirection(this._origin.y + (this.getHeight() * 0.5), player1.getOrigin().y + (player1.getHeight() * 0.5), true), true);

			// ball is hitting left player on their upper or lower side
			if (this._origin.y + this._height + this._direction.y >= player1.getOrigin().y && this._origin.y + this._direction.y <= player1.getOrigin().y + player1.getHeight())
				return (this.calculateDirection(this._origin.y + (this.getHeight() * 0.5), player1.getOrigin().y + (player1.getHeight() * 0.5), false), true);
		}
		return (false);
	}

	public isHittingPlayer2(player2: Player): boolean
	{
		if (player2.getHitCooldownState() == true)
			return (false);

		// ball is within boundaries of the player horizontally
		if (this._origin.x + this.getWidth() + this._direction.x >= player2.getOrigin().x - player2.getWidth() && this._origin.x + this._direction.x <= player2.getOrigin().x)
		{
			// ball is hitting right player on their left side
			if (this._origin.y + this._direction.y >= player2.getOrigin().y && this._origin.y + this._height + this._direction.y <= player2.getOrigin().y + player2.getHeight())
				return (this.calculateDirection(this._origin.y + (this.getHeight() * 0.5), player2.getOrigin().y + (player2.getHeight() * 0.5), true), true);

			// ball is hitting right player on their upper or lower side
			if (this._origin.y + this._height + this._direction.y >= player2.getOrigin().y && this._origin.y + this._direction.y <= player2.getOrigin().y + player2.getHeight())
				return (this.calculateDirection(this._origin.y + (this.getHeight() * 0.5), player2.getOrigin().y + (player2.getHeight() * 0.5), false), true);
		}
		return (false);
	}

	public calculateDirection(ballCenterHeight: number, playerCenterHeight: number, hitSides: boolean): void
	{
		let newDirectionY = ballCenterHeight - playerCenterHeight;
		if (newDirectionY < 0)
		{
			while (newDirectionY < -1)
				newDirectionY *= 0.10
		}
		else
		{
			while (newDirectionY > 1)
				newDirectionY *= 0.10
		}
		this._direction.y = newDirectionY * this._velocity;
	}

	public updateForResize(canvas: HTMLCanvasElement, relativeX: number, relativeY: number): void
	{
		this._origin.x = relativeX * canvas.width;
		this._origin.y = relativeY * canvas.height;
		this._width = canvas.width * 0.01;
		this._height = this._width;
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