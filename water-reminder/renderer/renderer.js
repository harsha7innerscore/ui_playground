const stage = document.getElementById("stage");
const msg = document.getElementById("msg");
const sprite = document.getElementById("sprite");
const yesBtn = document.getElementById("yesBtn");
const snoozeBtn = document.getElementById("snoozeBtn");
const confettiLayer = document.getElementById("confetti");

const AUTO_DISMISS_MS = 120000;
let autoTimer = null;

function clearAuto() {
  clearTimeout(autoTimer);
  autoTimer = null;
}

window.api.onReminder(({ greeting, snoozeMin }) => {
  sprite.src = "../assets/idle.png";
  msg.textContent = greeting;
  snoozeBtn.textContent = `SNOOZE ${snoozeMin}m`;
  yesBtn.disabled = false;
  snoozeBtn.disabled = false;
  stage.classList.remove("out");
  requestAnimationFrame(() => stage.classList.add("in"));

  clearAuto();
  autoTimer = setTimeout(() => walkOff("dismiss"), AUTO_DISMISS_MS);
});

yesBtn.addEventListener("click", async () => {
  clearAuto();
  yesBtn.disabled = true;
  snoozeBtn.disabled = true;
  sprite.src = "../assets/drinking.png";
  msg.textContent = await window.api.getCheer();
  spawnConfetti();
  setTimeout(() => walkOff("drank"), 1300);
});

snoozeBtn.addEventListener("click", () => {
  clearAuto();
  walkOff("snooze");
});

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
  for (let i = 0; i < 18; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${40 + Math.random() * 100}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
}
