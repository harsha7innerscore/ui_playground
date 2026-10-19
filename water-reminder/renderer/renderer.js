const stage = document.getElementById("stage");
const msg = document.getElementById("msg");
const sprite = document.getElementById("sprite");
const yesBtn = document.getElementById("yesBtn");
const snoozeBtn = document.getElementById("snoozeBtn");
const confettiLayer = document.getElementById("confetti");

const AUTO_DISMISS_MS = 120000;
const IDLE_LOOP_MS = 2200;
const DRINK_SEQUENCE = ["reach.png", "raise.png", "drinking.png", "good.png"];
const DRINK_FRAME_MS = 420;

let autoTimer = null;
let idleTimer = null;
let idleFrame = 0;
const IDLE_FRAMES = ["idle.png", "reach.png"];

function clearAuto() {
  clearTimeout(autoTimer);
  autoTimer = null;
}

function startIdleLoop() {
  stopIdleLoop();
  idleFrame = 0;
  idleTimer = setInterval(() => {
    idleFrame = (idleFrame + 1) % IDLE_FRAMES.length;
    sprite.src = `../assets/${IDLE_FRAMES[idleFrame]}`;
  }, IDLE_LOOP_MS);
}

function stopIdleLoop() {
  clearInterval(idleTimer);
  idleTimer = null;
}

window.api.onReminder(({ greeting, snoozeMin }) => {
  sprite.src = "../assets/idle.png";
  msg.textContent = greeting;
  snoozeBtn.textContent = `SNOOZE ${snoozeMin}m`;
  yesBtn.disabled = false;
  snoozeBtn.disabled = false;
  stage.classList.remove("out");
  requestAnimationFrame(() => stage.classList.add("in"));

  startIdleLoop();
  clearAuto();
  autoTimer = setTimeout(() => walkOff("dismiss"), AUTO_DISMISS_MS);
});

yesBtn.addEventListener("click", () => {
  clearAuto();
  stopIdleLoop();
  yesBtn.disabled = true;
  snoozeBtn.disabled = true;
  playDrinkSequence();
});

snoozeBtn.addEventListener("click", () => {
  clearAuto();
  stopIdleLoop();
  walkOff("snooze");
});

async function playDrinkSequence() {
  for (const frame of DRINK_SEQUENCE) {
    sprite.src = `../assets/${frame}`;
    await wait(DRINK_FRAME_MS);
  }
  msg.textContent = await window.api.getCheer();
  spawnConfetti();
  await wait(1100);
  walkOff("drank");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function walkOff(reason) {
  stage.classList.remove("in");
  stage.classList.add("out");
  setTimeout(() => {
    if (reason === "drank") window.api.drank();
    else if (reason === "snooze") window.api.snooze();
    else window.api.dismiss();
    window.api.hide();
  }, 420);
}

function spawnConfetti() {
  const colors = ["#2fa8ff", "#5be0a3", "#ffd23f", "#ff6b6b", "#c77dff"];
  for (let i = 0; i < 22; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${30 + Math.random() * 150}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
}
