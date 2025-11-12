// Controls: W/S for left paddle, ArrowUp/ArrowDown for right paddle (or let AI control right paddle).

type Vec = { x: number; y: number };

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
document.body.style.margin = "0";
document.body.style.display = "flex";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.height = "100vh";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

class Paddle 
{
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;

	constructor(x: number, y: number, width = 12, height = 100, speed = 400)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
	}

	draw()
	{
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	inBounds()
	{
		if (this.y < 0)
			this.y = 0;
		if (this.y + this.height > canvas.height)
			this.y = canvas.height - this.height;
	}
}

class Ball
{
	pos: Vec;
	vel: Vec;
	radius: number;

	constructor(x: number, y: number, radius = 8)
	{
		this.pos = { x, y };
		this.radius = radius;
		this.vel = { x: 300 * (Math.random() > 0.5 ? 1 : -1), y: 160 * (Math.random() > 0.5 ? 1 : -1) };
	}

	reset(toRight = true)
	{
		this.pos.x = canvas.width / 2;
		this.pos.y = canvas.height / 2;
		const angle = (Math.random() * Math.PI / 4) - Math.PI / 8; // small angle
		const speed = 320;
		this.vel.x = (toRight ? 1 : -1) * Math.cos(angle) * speed;
		this.vel.y = Math.sin(angle) * speed;
	}

	update(dt: number)
	{
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;

		// top/bottom collision
		if (this.pos.y - this.radius < 0)
		{
			this.pos.y = this.radius;
			this.vel.y *= -1;
		}
		if (this.pos.y + this.radius > canvas.height)
		{
			this.pos.y = canvas.height - this.radius;
			this.vel.y *= -1;
		}
	}

	draw()
	{
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
	}
}