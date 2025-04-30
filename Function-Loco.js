const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;

let heartPath = [];
const Steps = 1000;
const PI2 = Math.PI * 2;
const particles = [];
const flyingHearts = [];
const clouds = [];

function generateHeartPath() {
  for (let i = 0; i < Steps; i++) {
    const t = (i / Steps) * PI2;
    const x = 180 * Math.pow(Math.sin(t), 3);
    const y =
      -10 *
      (15 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t));
    heartPath.push([w / 2 + x, h / 2 + y]);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 0;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha += 0.02;
    if (this.alpha > 1) this.alpha = 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, PI2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
  }
}

class FlyingHeart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 5 + Math.random() * 10;
    this.alpha = 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * -3 - 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha})`;
    ctx.fill();
  }
}

class Cloud {
  constructor() {
    this.x = Math.random() * w;
    this.y = (Math.random() * h) / 2;
    this.size = Math.random() * 100 + 50;
    this.speedX = Math.random() * 0.5 + 0.1;
    this.alpha = 0.2 + Math.random() * 0.3;
  }

  update() {
    this.x += this.speedX;
    if (this.x > w) this.x = -this.size;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
  }
}

let pulse = 0;
let pulseDir = 1;
let lightOffset = 0;

function drawBackground() {
  ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
  for (let i = 0; i < 10; i++) {
    const starX = Math.random() * w;
    const starY = Math.random() * h;
    ctx.beginPath();
    ctx.arc(starX, starY, 1, 0, PI2);
    ctx.fill();
  }
}

function drawLightEffects() {
  const lightRadius = 300;
  const xCenter = w / 2;
  const yCenter = h / 2;
  const angle = (Date.now() / 1000) * 0.3;
  ctx.beginPath();
  for (let i = 0; i < 360; i++) {
    const radians = (i * Math.PI) / 180;
    const offsetX = Math.sin(radians + angle) * lightRadius;
    const offsetY = Math.cos(radians + angle) * lightRadius;
    ctx.lineTo(xCenter + offsetX, yCenter + offsetY);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function animate() {
  drawBackground();

  ctx.clearRect(0, 0, w, h);

  pulse += pulseDir * 0.3;
  if (pulse > 5 || pulse < -5) pulseDir *= -1;

  ctx.beginPath();
  for (let i = 0; i < heartPath.length; i++) {
    const [x, y] = heartPath[i];
    const scale = 1 + pulse * 0.005;
    const dx = (x - w / 2) * scale;
    const dy = (y - h / 2) * scale;
    if (i === 0) ctx.moveTo(w / 2 + dx, h / 2 + dy);
    else ctx.lineTo(w / 2 + dx, h / 2 + dy);
  }
  ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "red";
  ctx.stroke();

  drawLightEffects();

  lightOffset += 3;
  if (lightOffset >= heartPath.length) lightOffset = 0;

  for (let i = 0; i < 20; i++) {
    const idx = (lightOffset + i * 3) % heartPath.length;
    const [x, y] = heartPath[idx];
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, PI2);
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - i / 20})`;
    ctx.fill();
  }

  if (lightOffset % 100 === 0) {
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 30;
      const [x, y] = heartPath[lightOffset];
      const particle = new Particle(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance
      );
      particles.push(particle);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.alpha <= 0) particles.splice(i, 1);
  }

  if (Math.random() < 0.05) {
    const heartIdx = Math.floor(Math.random() * heartPath.length);
    const [x, y] = heartPath[heartIdx];
    const flyingHeart = new FlyingHeart(x, y);
    flyingHearts.push(flyingHeart);
  }

  for (let i = flyingHearts.length - 1; i >= 0; i--) {
    const heart = flyingHearts[i];
    heart.update();
    heart.draw();
    if (heart.alpha <= 0) flyingHearts.splice(i, 1);
  }

  if (Math.random() < 0.001) {
    clouds.push(new Cloud());
  }

  for (let i = 0; i < clouds.length; i++) {
    clouds[i].update();
    clouds[i].draw();
  }

  ctx.shadowBlur = 0;
  requestAnimationFrame(animate);
}

generateHeartPath();
animate();
