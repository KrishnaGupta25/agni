/* AGNI — marketing site behaviour. No dependencies. */

/* Single source of truth for contact details, fees and WhatsApp messages. */
const CONFIG = {
  phones: ["919879269578", "917573814910"],
  fees: { regular: "₹7,000", early: "₹2,999" },
  messages: {
    general:
      "Hi AGNI team, I would like to know more about the 3-month DSA in C++ course. Please share the batch schedule, class timings and enrollment details.",
    earlybird:
      "Hi AGNI team, I am interested in joining the 3-month DSA in C++ course at the early-bird fee of ₹2,999. Please share the batch schedule and enrollment details.",
    question:
      "Hi AGNI team, I have a question about the 3-month DSA in C++ course.",
  },
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.documentElement.classList.add("js");

/* ---------- Fees & year ---------- */
$$("[data-price]").forEach((el) => {
  const value = CONFIG.fees[el.dataset.price];
  if (value) el.textContent = value;
});
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- WhatsApp links ---------- */
const waLink = (phoneIndex, msgKey) => {
  const phone = CONFIG.phones[phoneIndex] ?? CONFIG.phones[0];
  const text = CONFIG.messages[msgKey] ?? CONFIG.messages.general;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};
$$("[data-wa]").forEach((a) => {
  a.href = waLink(Number(a.dataset.wa), a.dataset.waMsg);
});

/* ---------- Sticky nav state ---------- */
const nav = $("[data-nav]");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const toggle = $("[data-menu-toggle]");
const menu = $("[data-menu]");

const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  toggle.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
  menu.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
};

toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); }
});
window.matchMedia("(min-width: 1000px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

/* ---------- Scroll spy: primary nav ---------- */
const spyLinks = $$("[data-spy]");
const spyMap = { format: "why" }; // sections without their own nav item; unmapped ones clear the highlight
const spyTargets = $$("main > section[id]");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = spyMap[entry.target.id] ?? entry.target.id;
      spyLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.spy === id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
spyTargets.forEach((s) => spyObserver.observe(s));

/* ---------- Curriculum month nav ---------- */
const monthLinks = $$("[data-month-link]");
const monthObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      monthLinks.forEach((l) => {
        const active = l.dataset.monthLink === entry.target.id;
        l.classList.toggle("is-active", active);
        if (active) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
$$("[data-month]").forEach((m) => monthObserver.observe(m));

/* ---------- FAQ: keep one answer open at a time ---------- */
const faqItems = $$("[data-accordion] details");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
  });
});

/* ---------- Copy phone number ---------- */
const toast = $("[data-toast]");
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2000);
};

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
};

$$("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const use = btn.querySelector("use");
    try {
      await copyText(btn.dataset.copy);
      btn.classList.add("is-copied");
      use.setAttribute("href", "#i-check");
      showToast(`Copied ${btn.dataset.copy}`);
      setTimeout(() => { btn.classList.remove("is-copied"); use.setAttribute("href", "#i-copy"); }, 1800);
    } catch {
      showToast("Couldn't copy — please note the number manually");
    }
  });
});

/* ---------- Mobile sticky CTA: show after hero, hide at contact ---------- */
const sticky = $("[data-sticky-cta]");
const stickyLink = sticky.querySelector("a");
const visibility = { pastHero: false, atContact: false };
const updateSticky = () => {
  const show = visibility.pastHero && !visibility.atContact;
  sticky.classList.toggle("is-visible", show);
  sticky.setAttribute("aria-hidden", String(!show));
  stickyLink.tabIndex = show ? 0 : -1;
};
new IntersectionObserver(([e]) => { visibility.pastHero = !e.isIntersecting; updateSticky(); }).observe($("#home"));
new IntersectionObserver(([e]) => { visibility.atContact = e.isIntersecting; updateSticky(); }, { threshold: 0.05 }).observe($("#contact"));

/* ---------- Subtle reveal on scroll ---------- */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealEls = $$(".section-head, .why__intro, .benefits, .format__live, .format__stack, .month, .mentor, .ready__intro, .ladder, .plan, .faq__intro, .accordion, .contact__head, .contacts, .statement__inner");
  revealEls.forEach((el) => el.setAttribute("data-reveal", ""));
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); obs.unobserve(entry.target); }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}
