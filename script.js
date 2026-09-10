const countdown = document.querySelector("[data-event-date]");
const joinModal = document.querySelector("[data-join-modal]");
const openJoinButtons = document.querySelectorAll("[data-open-join]");
const closeJoinButtons = document.querySelectorAll("[data-close-join]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("[data-main-nav]");
const appConfig = window.LEGADO_APP_CONFIG || {};
const analyticsConfig = appConfig.analytics || {};

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
  const payload = { event: name, device };
  window.dataLayer.push(payload);
  if (typeof window.gtag === "function") {
    window.gtag("event", name, { device_category: device });
  }
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, { device });
  }
  if (name === "click_acessar_app" || name === "click_qr_code" || name === "click_baixar_android") {
    const deviceEvent = `tentativa_acesso_app_${device}`;
    window.dataLayer.push({ event: deviceEvent });
    if (typeof window.gtag === "function") {
      window.gtag("event", deviceEvent);
    }
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", deviceEvent);
    }
  }
}

function loadExternalScript(src, onload) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  if (onload) script.addEventListener("load", onload, { once: true });
  document.head.appendChild(script);
}

function initAnalytics() {
  const { googleMeasurementId, googleTagManagerId, metaPixelId } = analyticsConfig;

  window.dataLayer = window.dataLayer || [];

  if (googleTagManagerId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadExternalScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(googleTagManagerId)}`);
  }

  if (googleMeasurementId) {
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", googleMeasurementId, { send_page_view: true });
    loadExternalScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleMeasurementId)}`);
  }

  if (metaPixelId) {
    window.fbq = window.fbq || function fbq() {
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
    };
    window.fbq.queue = window.fbq.queue || [];
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
    loadExternalScript("https://connect.facebook.net/en_US/fbevents.js");
  }
}

function applyAppLinks() {
  document.querySelectorAll("[data-app-link]").forEach((link) => {
    if (appConfig.appWebUrl) link.href = appConfig.appWebUrl;
  });
  document.querySelectorAll("[data-android-link]").forEach((link) => {
    if (appConfig.androidUrl) link.href = appConfig.androidUrl;
  });
  document.querySelectorAll("[data-app-store-link]").forEach((element) => {
    element.textContent = appConfig.appStoreUrl ? "Baixar na App Store" : (appConfig.appStoreLabel || "Em breve na App Store");
    if (!appConfig.appStoreUrl) return;

    const link = document.createElement("a");
    link.className = element.className.replace("button-disabled", "button-dark");
    link.href = appConfig.appStoreUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.appStoreLink = "";
    link.dataset.track = "click_baixar_app_store";
    link.textContent = "Baixar na App Store";
    element.replaceWith(link);
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
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  if (!menuToggle || !mainNav) return;
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mainNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
}

initAnalytics();
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

document.addEventListener("click", (event) => {
  if (!mainNav || !menuToggle || !mainNav.classList.contains("is-open")) return;
  if (mainNav.contains(event.target) || menuToggle.contains(event.target)) return;
  closeMenu();
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 1001px)").matches) closeMenu();
});

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => trackEvent(element.dataset.track));
});
