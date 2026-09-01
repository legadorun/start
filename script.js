const countdown = document.querySelector("[data-event-date]");
const joinModal = document.querySelector("[data-join-modal]");
const openJoinButtons = document.querySelectorAll("[data-open-join]");
const closeJoinButtons = document.querySelectorAll("[data-close-join]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("[data-main-nav]");
const appConfig = window.LEGADO_APP_CONFIG || {};

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
  const device = window.matchMedia("(max-width: 680px)").matches ? "mobile" : "desktop";
  window.dataLayer.push({ event: name, device });
  if (name === "click_acessar_app" || name === "click_qr_code" || name === "click_baixar_android") {
    window.dataLayer.push({ event: `tentativa_acesso_app_${device}` });
  }
}

function applyAppLinks() {
  document.querySelectorAll("[data-app-link]").forEach((link) => {
    if (appConfig.appWebUrl) link.href = appConfig.appWebUrl;
  });
  document.querySelectorAll("[data-android-link]").forEach((link) => {
    if (appConfig.androidUrl) link.href = appConfig.androidUrl;
  });
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

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  mainNav.classList.remove("is-open");
}

function toggleMenu() {
  if (!menuToggle || !mainNav) return;
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mainNav.classList.toggle("is-open", !isOpen);
}

cleanTrackingQuery();
applyAppLinks();
updatePricing();
updateCountdown();
setInterval(updateCountdown, 1000);

openJoinButtons.forEach((button) => button.addEventListener("click", openJoinModal));
closeJoinButtons.forEach((button) => button.addEventListener("click", closeJoinModal));
if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
if (mainNav) mainNav.querySelectorAll("a, button").forEach((item) => item.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeJoinModal();
  if (event.key === "Escape") closeMenu();
});

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => trackEvent(element.dataset.track));
});
