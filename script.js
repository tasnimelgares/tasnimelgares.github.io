document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  const root = document.documentElement;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // TEXTES DE L'INTERFACE (les contenus de la page sont dans i18n.js)
  const UI = {
    fr: { dark: "Mode sombre", showAll: "Afficher tout", less: "Voir moins", prev: "Projet précédent", next: "Projet suivant",
          enlarge: n => `Agrandir la photo ${n}`, photo: n => `Photo du concours fullstack 2026 (${n}/3)`, preview: "Aperçu",
          lightbox: "Photo agrandie", lang: "EN", langLabel: "Switch to English",
          desc: "Portfolio de Tasnim El Gares, élève-ingénieure en informatique à Polytech Nice Sophia." },
    en: { dark: "Dark mode", showAll: "Show all", less: "Show less", prev: "Previous project", next: "Next project",
          enlarge: n => `Enlarge photo ${n}`, photo: n => `Fullstack competition 2026 photo (${n}/3)`, preview: "Preview of",
          lightbox: "Enlarged photo", lang: "FR", langLabel: "Passer en français",
          desc: "Portfolio of Tasnim El Gares, computer science engineering student at Polytech Nice Sophia." }
  };
  let lang = store.get("lang") === "en" ? "en" : "fr";

  const grid = document.getElementById("grid");
  const btn = document.getElementById("toggle");
  const themeBtn = document.getElementById("theme");
  const langBtn = document.getElementById("lang");
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.dataset.theme || (dark.matches ? "dark" : "light");

  // MODE SOMBRE / CLAIR : interrupteur (suit le navigateur tant qu'on n'a pas choisi)
  const themeLabel = () => {
    themeBtn.setAttribute("aria-checked", current() === "dark");
    themeBtn.setAttribute("aria-label", UI[lang].dark);
    themeBtn.title = UI[lang].dark;
  };
  themeBtn.onclick = () => {
    root.dataset.theme = current() === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    themeLabel();
  };
  dark.addEventListener("change", themeLabel);

  // SECTIONS REPLIABLES : seuls les titres sont visibles au départ
  const sections = [...document.querySelectorAll("main .section")];
  const setOpen = (sec, open) => {
    sec.classList.toggle("closed", !open);
    sec.querySelector(".sec-body").hidden = !open;
    sec.querySelector(".sec-toggle").setAttribute("aria-expanded", open);
  };
  sections.forEach(sec => {
    const h2 = sec.querySelector("h2");
    const body = document.createElement("div");
    body.className = "sec-body";
    body.id = sec.id + "-body";
    while (h2.nextSibling) body.appendChild(h2.nextSibling);
    h2.after(body);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sec-toggle";
    b.setAttribute("aria-controls", body.id);
    b.textContent = h2.textContent;
    h2.textContent = "";
    h2.appendChild(b);
    b.onclick = () => setOpen(sec, sec.classList.contains("closed"));
    setOpen(sec, false);
  });
  const openFromHash = hash => {
    const t = hash && document.getElementById(hash.slice(1));
    const sec = t && t.closest(".section");
    if (sec) setOpen(sec, true);
    return t;
  };
  document.querySelectorAll('a[href^="#"]').forEach(a =>
    a.addEventListener("click", () => openFromHash(a.getAttribute("href"))));
  const first = openFromHash(location.hash);
  if (first) requestAnimationFrame(() => first.scrollIntoView());

  // CAROUSEL
  const carousel = document.getElementById("carousel");
  document.getElementById("prev").onclick = () => carousel.scrollBy({ left: -carousel.offsetWidth, behavior: "smooth" });
  document.getElementById("next").onclick = () => carousel.scrollBy({ left: carousel.offsetWidth, behavior: "smooth" });

  // AFFICHER TOUT
  const toggleLabel = () => { btn.textContent = grid.classList.contains("active") ? UI[lang].less : UI[lang].showAll; };
  btn.onclick = () => {
    const open = grid.classList.toggle("active");
    btn.setAttribute("aria-expanded", open);
    toggleLabel();
  };

  // CARTES CLIQUABLES (souris + clavier), sauf liens et galerie photos
  document.querySelectorAll(".clickable-card").forEach(card => {
    const open = () => { const u = card.dataset.url; if (u) window.open(u, "_blank", "noopener"); };
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.addEventListener("click", e => { if (!e.target.closest("a, .gallery")) open(); });
    card.addEventListener("keydown", e => { if (e.key === "Enter" && e.target === card) open(); });
  });

  // GALERIE : clic = photo en grand ; une photo absente est simplement masquée
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  document.querySelectorAll(".gallery").forEach(g => {
    const check = () => { if (!g.querySelector(".thumb")) g.remove(); };
    g.querySelectorAll(".thumb").forEach(t => {
      const img = t.querySelector("img");
      const drop = () => { t.remove(); check(); };
      if (img.complete && img.naturalWidth === 0) drop();
      img.addEventListener("error", drop);
      t.onclick = () => { lbImg.src = img.src; lbImg.alt = img.alt; lb.showModal(); };
    });
  });
  lb.onclick = () => lb.close();

  // ONGLETS
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      document.getElementById(t.dataset.panel).hidden = !on;
    });
  }));

  // LANGUE FR / EN
  const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const norm = s => s.replace(/\s+/g, " ").trim();
  const applyLang = () => {
    const skip = "script, dialog, #theme, #lang, #toggle";
    document.querySelectorAll("body *").forEach(el => {
      if (!el.isConnected || el.closest(skip)) return;
      if (lang === "fr") {
        if (el._fr !== undefined) { el.innerHTML = el._fr; delete el._fr; }
      } else if (el._fr === undefined && hasText(el)) {
        const v = EN[norm(el.textContent)];
        if (v !== undefined) { el._fr = el.innerHTML; el.innerHTML = v; }
      }
    });
    const u = UI[lang];
    root.lang = lang;
    document.querySelector('meta[name="description"]').content = u.desc;
    document.getElementById("prev").setAttribute("aria-label", u.prev);
    document.getElementById("next").setAttribute("aria-label", u.next);
    lb.setAttribute("aria-label", u.lightbox);
    document.querySelectorAll(".gallery .thumb").forEach((t, i) => {
      t.setAttribute("aria-label", u.enlarge(i % 3 + 1));
      t.querySelector("img").alt = u.photo(i % 3 + 1);
    });
    document.querySelectorAll(".project img:not(.thumb img)").forEach(img => {
      if (img.dataset.n === undefined) img.dataset.n = img.alt.replace(/^Aperçu /, "");
      img.alt = `${u.preview} ${img.dataset.n}`;
    });
    langBtn.textContent = u.lang;
    langBtn.setAttribute("aria-label", u.langLabel);
    langBtn.title = u.langLabel;
    toggleLabel();
    themeLabel();
  };
  langBtn.onclick = () => {
    lang = lang === "fr" ? "en" : "fr";
    store.set("lang", lang);
    applyLang();
  };
  applyLang();
});