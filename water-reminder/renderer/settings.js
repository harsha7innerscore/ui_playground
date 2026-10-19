const form = document.getElementById("f");
const fields = ["name", "intervalMin", "activeStartHour", "activeEndHour", "snoozeMin"];

const onboarding = new URLSearchParams(location.search).get("onboarding") === "1";
if (onboarding) {
  document.getElementById("title").textContent = "Welcome. I am Neo.";
  document.getElementById("subtitle").textContent =
    "Tell me your name and how often you want a water break, then click Save.";
}

window.settingsApi.get().then((config) => {
  for (const key of fields) {
    document.getElementById(key).value = config[key];
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {};
  for (const key of fields) {
    data[key] = document.getElementById(key).value;
  }
  window.settingsApi.save(data);
});
