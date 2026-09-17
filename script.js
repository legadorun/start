const countdown = document.querySelector("[data-event-date]");
const joinModal = document.querySelector("[data-join-modal]");
const openJoinButtons = document.querySelectorAll("[data-open-join]");
const closeJoinButtons = document.querySelectorAll("[data-close-join]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("[data-main-nav]");
const appConfig = window.LEGADO_APP_CONFIG || {};
const analyticsConfig = appConfig.analytics || {};
const campaignConfig = appConfig.campaign || {};
const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
];
const attributionStorageKey = "legado_run_attribution";
const scrollMilestones = [25, 50, 75, 90];
const trackedScrollMilestones = new Set();

const currentLot = {
  priceSimple: "R$ 109,90",
  priceComplete: "R$ 139,90",
};

function getDeviceCategory() {
  if (window.matchMedia("(max-width: 680px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1024px)").matches) return "tablet";
  return "desktop";
}

function getStoredAttribution() {
  try {
    return JSON.parse(window.sessionStorage.getItem(attributionStorageKey) || "{}");
  } catch {
    return {};
  }
}

function storeAttribution() {
  const params = new URLSearchParams(window.location.search);
  const incoming = {};

  attributionKeys.forEach((key) => {
    const value = params.get(key);
    if (value) incoming[key] = value;
  });

  if (!Object.keys(incoming).length) return getStoredAttribution();

  const attribution = {
    ...getStoredAttribution(),
    ...incoming,
    landing_page: window.location.pathname,
    captured_at: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
  } catch {
    return attribution;
  }

  return attribution;
}

function cleanTrackingQuery() {
  if (!window.location.search) return;

  const params = new URLSearchParams(window.location.search);
  const remaining = new URLSearchParams(params);
  attributionKeys.forEach((key) => remaining.delete(key));

  const nextSearch = remaining.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
  window.history.replaceState({}, document.title, nextUrl);
}

function getCampaignParams(element) {
  const attribution = getStoredAttribution();
  return {
    utm_source: attribution.utm_source || campaignConfig.source || "site",
    utm_medium: attribution.utm_medium || campaignConfig.medium || "organic",
    utm_campaign: attribution.utm_campaign || campaignConfig.campaign || "legado_run_2026",
    utm_content: attribution.utm_content || element?.dataset.utmContent || campaignConfig.content || "site_cta",
    ...(attribution.utm_term ? { utm_term: attribution.utm_term } : {}),
    ...(attribution.fbclid ? { fbclid: attribution.fbclid } : {}),
    ...(attribution.gclid ? { gclid: attribution.gclid } : {}),
  };
}

function appendCampaignParams(url, element) {
  try {
    const nextUrl = new URL(url, window.location.href);
    const params = getCampaignParams(element);
    Object.entries(params).forEach(([key, value]) => {
      if (value && !nextUrl.searchParams.has(key)) nextUrl.searchParams.set(key, value);
    });
    return nextUrl.toString();
  } catch {
    return url;
  }
}

function decorateOutboundLinks() {
  const trackedHosts = [
    "site.ticketsports.com.br",
    "www.ticketsports.com.br",
    "legado-run.vercel.app",
    "legadorun.github.io",
    "play.google.com",
  ];

  document.querySelectorAll("a[href]").forEach((link) => {
    try {
      const url = new URL(link.href, window.location.href);
      if (!trackedHosts.includes(url.hostname)) return;
      link.href = appendCampaignParams(url.toString(), link);
    } catch {
      // Keep the original link if URL parsing fails.
    }
  });
}

function getLinkContext(element) {
  const href = element?.getAttribute("href") || "";
  const url = href ? new URL(href, window.location.href) : null;
  const label = (element?.textContent || element?.getAttribute("aria-label") || "").trim().slice(0, 80);
  const section = element?.closest("section, header, footer")?.id || element?.closest("section, header, footer")?.className || "page";
  const details = {
    link_text: label,
    link_url: url ? url.toString() : href,
    link_domain: url ? url.hostname : "",
    page_path: window.location.pathname,
    section: String(section).slice(0, 80),
  };

  if (element?.closest("[data-distance]")) {
    details.distance = element.closest("[data-distance]").dataset.distance;
  }

  return details;
}

function trackEvent(name, details = {}) {
  window.dataLayer = window.dataLayer || [];
  const device = getDeviceCategory();
  const payload = { event: name, device_category: device, ...details };
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", name, { device_category: device, ...details });
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, { device_category: device, ...details });
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

function trackMetaStandardEvent(name, details = {}) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", name, details);
}

function trackConversionIntent(eventNames, details) {
  const events = new Set(eventNames);

  if (events.has("begin_checkout") || events.has("click_registration")) {
    trackMetaStandardEvent("InitiateCheckout", {
      content_name: "Inscricao LEGADO RUN",
      content_category: "Evento esportivo",
      currency: "BRL",
      value: 109.9,
      ...details,
    });
  }

  if (events.has("click_patrocinador")) {
    trackMetaStandardEvent("Lead", {
      content_name: "Patrocinio LEGADO RUN",
      content_category: "Patrocinadores",
      ...details,
    });
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

function applyConfiguredLinks() {
  document.querySelectorAll("a[href*='ticketsports.com.br']").forEach((link) => {
    if (appConfig.registrationUrl) link.href = appConfig.registrationUrl;
    if (!link.dataset.track) link.dataset.track = "click_registration begin_checkout";
    if (!link.dataset.utmContent) link.dataset.utmContent = "inscricao";
  });

  document.querySelectorAll("a[href*='legadorun.github.io/patrocinadores']").forEach((link) => {
    if (appConfig.sponsorUrl) link.href = appConfig.sponsorUrl;
    if (!link.dataset.track) link.dataset.track = "click_patrocinador";
    if (!link.dataset.utmContent) link.dataset.utmContent = "patrocinadores";
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
storeAttribution();
cleanTrackingQuery();
applyAppLinks();
applyConfiguredLinks();
decorateOutboundLinks();
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
  element.addEventListener("click", () => {
    const details = getLinkContext(element);
    const eventNames = element.dataset.track
      .split(/[\s,]+/)
      .filter(Boolean);

    eventNames.forEach((eventName) => trackEvent(eventName, details));
    trackConversionIntent(eventNames, details);
  });
});

document.querySelectorAll("a[href]").forEach((element) => {
  element.addEventListener("click", () => {
    const details = getLinkContext(element);
    if (!details.link_domain) return;
    if (details.link_domain !== window.location.hostname) {
      trackEvent("click_outbound_link", details);
    }
  });
});

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    trackEvent("open_faq", {
      question: (item.querySelector("summary")?.textContent || "").trim(),
      page_path: window.location.pathname,
    });
  });
});

window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return;

  const percent = Math.round((window.scrollY / scrollable) * 100);
  scrollMilestones.forEach((milestone) => {
    if (percent < milestone || trackedScrollMilestones.has(milestone)) return;
    trackedScrollMilestones.add(milestone);
    trackEvent("scroll_depth", {
      percent_scrolled: milestone,
      page_path: window.location.pathname,
    });
  });
}, { passive: true });

const viewTrackedSections = document.querySelectorAll("[data-view-track]");
if ("IntersectionObserver" in window && viewTrackedSections.length) {
  const viewObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      trackEvent(entry.target.dataset.viewTrack);
      viewObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  viewTrackedSections.forEach((section) => viewObserver.observe(section));
} else {
  viewTrackedSections.forEach((section) => trackEvent(section.dataset.viewTrack));
}

const siteHeader = document.querySelector(".site-header");
function updateHeader() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const heroVideo = document.querySelector("[data-hero-video]");
if (heroVideo && window.matchMedia("(min-width: 768px)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const loadHeroVideo = () => {
    const source = heroVideo.querySelector("source[data-src]");
    if (!source) return;
    source.src = source.dataset.src;
    source.removeAttribute("data-src");
    heroVideo.load();
    heroVideo.play().catch(() => {});
  };
  window.addEventListener("load", () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(loadHeroVideo, { timeout: 1600 });
    else window.setTimeout(loadHeroVideo, 500);
  }, { once: true });
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const galleryFilters = document.querySelectorAll("[data-gallery-filter]");
const galleryItems = document.querySelectorAll("[data-gallery-item]");
galleryFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const selected = filter.dataset.galleryFilter;
    galleryFilters.forEach((item) => item.classList.toggle("is-active", item === filter));
    galleryItems.forEach((item) => {
      item.hidden = selected !== "todos" && item.dataset.galleryItem !== selected;
    });
  });
});

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("img");
document.querySelectorAll("[data-lightbox-source]").forEach((item) => {
  item.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    const image = item.querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightbox.hidden = false;
    lightbox.querySelector("button")?.focus();
  });
});
lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
});
lightbox?.addEventListener("click", (event) => {
  if (event.target !== lightbox) return;
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) {
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
  }
});
