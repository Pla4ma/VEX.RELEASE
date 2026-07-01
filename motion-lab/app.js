const canvas = document.querySelector("#field");
const ctx = canvas.getContext("2d");
const shot = document.querySelector("#shot");
const replay = document.querySelector("#replay");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let particles = [];
let start = performance.now();
let frame = 0;

function size() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  width = innerWidth;
  height = innerHeight;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function makeParticles() {
  const count = Math.min(560, Math.floor((width * height) / 2200));
  particles = Array.from({ length: count }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const lane = (index % 160) / 160;
    const targetX = width / 2 + side * (40 + lane * width * .19);
    const targetY = height * (.3 + lane * .48);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      tx: targetX,
      ty: targetY,
      r: 1 + Math.random() * 2.8,
      hue: [55, 186, 333][index % 3],
      drift: Math.random() * Math.PI * 2
    };
  });
}

function ease(t) {
  return 1 - Math.pow(1 - t, 4);
}

function draw(now) {
  const time = Math.min((now - start) / 5000, 1);
  const pull = ease(Math.max(0, (time - .08) / .68));
  const burst = Math.max(0, 1 - Math.abs(time - .64) / .18);
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(5, 5, 7, ${reduceMotion ? 1 : .2})`;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "lighter";
  for (const particle of particles) {
    const wave = Math.sin(particle.drift + time * 9) * 34 * (1 - pull);
    const x = particle.x + (particle.tx - particle.x) * pull + wave;
    const y = particle.y + (particle.ty - particle.y) * pull - burst * 120;
    const alpha = .16 + pull * .54 + burst * .38;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${particle.hue}, 100%, 64%, ${alpha})`;
    ctx.arc(x, y, particle.r + burst * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (time < 1 && !reduceMotion) {
    frame = requestAnimationFrame(draw);
  }
}

function play() {
  cancelAnimationFrame(frame);
  shot.classList.remove("active");
  shot.classList.add("restart");
  start = performance.now();
  makeParticles();
  requestAnimationFrame(() => {
    shot.classList.remove("restart");
    shot.classList.add("active");
    frame = requestAnimationFrame(draw);
  });
}

addEventListener("resize", () => {
  size();
  makeParticles();
  draw(performance.now() + 5000);
});

addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    play();
  }
});

replay.addEventListener("click", play);
size();
play();
