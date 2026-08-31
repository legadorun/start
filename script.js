const countdown = document.querySelector("[data-event-date]");

function cleanTrackingQuery() {
  if (!window.location.search) return;

  const cleanUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

const currentLot = {
  lotNumber: 1,
  lotName: "1º lote",
  startDate: null,
  endDate: null,
  priceSimple: "R$ 109,90 + taxas plataforma",
  priceComplete: "R$ 139,90 + taxas plataforma",
  status: "active",
};

function updatePricing() {
  const simple = document.querySelector("[data-price-simple]");
  const complete = document.querySelector("[data-price-complete]");

  if (simple) simple.textContent = currentLot.priceSimple;
  if (complete) complete.textContent = currentLot.priceComplete;
}

function updateCountdown() {
  if (!countdown) return;

  const target = new Date(countdown.dataset.eventDate).getTime();
  const now = Date.now();
  const distance = Math.max(0, target - now);

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdown.querySelector("[data-days]").textContent = String(days);
  countdown.querySelector("[data-hours]").textContent = String(hours).padStart(2, "0");
  countdown.querySelector("[data-minutes]").textContent = String(minutes).padStart(2, "0");
  countdown.querySelector("[data-seconds]").textContent = String(seconds).padStart(2, "0");
}

cleanTrackingQuery();
updatePricing();
updateCountdown();
setInterval(updateCountdown, 1000);
