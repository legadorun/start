const countdown = document.querySelector("[data-event-date]");
const joinModal = document.querySelector("[data-join-modal]");
const openJoinButtons = document.querySelectorAll("[data-open-join]");
const closeJoinButtons = document.querySelectorAll("[data-close-join]");

const currentLot = {
  priceSimple: "R$ 109,90 + taxas plataforma",
  priceComplete: "R$ 139,90 + taxas plataforma",
};

function cleanTrackingQuery() {
  if (!window.location.search) return;
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
}

function trackEvent(name) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name });
}

function updatePricing() {
  const simple = document.querySelector("[data-price-simple]");
  const complete = document.querySelector("[data-price-complete]");
  if (simple) simple.textContent = currentLot.priceSimple;
  if (complete) complete.textContent = currentLot.priceComplete;
}

function updateCountdown() {
  if (!countdown) return;

  const target = new Date(countdown.dataset.eventDate).getTime();
  const distance = Math.max(0, target - Date.now());
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdown.querySelector("[data-days]").textContent = String(days);
  countdown.querySelector("[data-hours]").textContent = String(hours).padStart(2, "0");
  countdown.querySelector("[data-minutes]").textContent = String(minutes).padStart(2, "0");
  countdown.querySelector("[data-seconds]").textContent = String(seconds).padStart(2, "0");
}

function openJoinModal() {
  if (!joinModal) return;
  joinModal.hidden = false;
  document.body.classList.add("modal-open");
  trackEvent("click_fazer_parte");
}

function closeJoinModal() {
  if (!joinModal) return;
  joinModal.hidden = true;
  document.body.classList.remove("modal-open");
}

cleanTrackingQuery();
updatePricing();
updateCountdown();
setInterval(updateCountdown, 1000);

openJoinButtons.forEach((button) => button.addEventListener("click", openJoinModal));
closeJoinButtons.forEach((button) => button.addEventListener("click", closeJoinModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeJoinModal();
});

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => trackEvent(element.dataset.track));
});
