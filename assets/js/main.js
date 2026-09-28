/* ==========================================================================
   MISS RDC 2026 — interactions et animations
   GSAP + ScrollTrigger + SplitText + Lenis (dossier assets/vendor).
   Sans ces bibliothèques ou avec « réduire les animations », le site reste
   entièrement lisible : seules les animations sont ignorées.
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var motion = hasGsap && !reduced && html.classList.contains("motion");
  if (!motion) html.classList.remove("motion", "is-arriving");

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var ARROW = '<svg class="arr" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 10h14M12 5l5 5-5 5"/></svg>';

  /* flèches des boutons */
  $$("[data-arrow]").forEach(function (el) { el.insertAdjacentHTML("beforeend", ARROW); });

  /* ------------------------------------------------------------------
     Navigation
     ------------------------------------------------------------------ */
  var nav = $(".nav");
  var drawer = $(".drawer");
  var burger = $(".burger");
  var lenis = null;

  function setMenu(open) {
    if (!nav || !drawer) return;
    nav.classList.toggle("is-open", open);
    drawer.classList.toggle("is-open", open);
    burger && burger.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav && nav.classList.contains("is-open")) setMenu(false); });

  var lastY = window.scrollY;
  function onScroll() {
    if (!nav) return;
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    if (!nav.classList.contains("is-open")) nav.classList.toggle("is-hidden", fine && y > lastY && y > 240);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Compte à rebours vers le gala
     ------------------------------------------------------------------ */
  $$("[data-countdown]").forEach(function (cd) {
    var target = new Date(cd.getAttribute("data-countdown")).getTime();
    var f = { j: $('[data-u="j"]', cd), h: $('[data-u="h"]', cd), m: $('[data-u="m"]', cd), s: $('[data-u="s"]', cd) };
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    function tick() {
      var d = Math.max(0, target - Date.now());
      if (f.j) f.j.textContent = Math.floor(d / 864e5);
      if (f.h) f.h.textContent = pad(Math.floor((d % 864e5) / 36e5));
      if (f.m) f.m.textContent = pad(Math.floor((d % 36e5) / 6e4));
      if (f.s) f.s.textContent = pad(Math.floor((d % 6e4) / 1e3));
    }
    tick();
    setInterval(tick, 1000);
  });

  /* ------------------------------------------------------------------
     Film : lecture au clic
     ------------------------------------------------------------------ */
  $$("[data-film]").forEach(function (film) {
    var video = $("video", film);
    var play = $(".film-play", film);
    if (!video || !play) return;
    play.addEventListener("click", function () {
      film.classList.add("is-playing");
      video.controls = true;
      video.muted = false;
      video.currentTime = 0;
      video.play();
    });
  });

  /* retour en haut */
  $$("[data-top]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ------------------------------------------------------------------
     Formulaires (vidéo de candidature + envoi de démonstration)
     ------------------------------------------------------------------ */
  $$("[data-video-field]").forEach(function (field) {
    var previewUrl = null;
    var btns = $$("[data-video-mode]", field);
    var panels = $$("[data-video-panel]", field);
    var fileInput = $("#video-file", field);
    var drop = $(".upload-drop", field);
    var preview = $("[data-video-preview]", field);
    var player = $("[data-video-player]", field);
    var clearBtn = $("[data-video-clear]", field);

    function setMode(next) {
      btns.forEach(function (btn) {
        var active = btn.dataset.videoMode === next;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (p) { p.hidden = p.dataset.videoPanel !== next; });
    }
    function clearPreview() {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
      if (player) { player.removeAttribute("src"); player.load(); }
      if (fileInput) fileInput.value = "";
      if (preview) preview.hidden = true;
      if (drop) drop.hidden = false;
    }
    btns.forEach(function (btn) { btn.addEventListener("click", function () { setMode(btn.dataset.videoMode); }); });
    if (fileInput) fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (file.size > 100 * 1024 * 1024) {
        alert("La vidéo dépasse 100 Mo. Choisissez un fichier plus léger ou partagez un lien en ligne.");
        fileInput.value = "";
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(file);
      if (player) player.src = previewUrl;
      if (preview) preview.hidden = false;
      if (drop) drop.hidden = true;
    });
    if (clearBtn) clearBtn.addEventListener("click", clearPreview);
    field.closest("form").addEventListener("reset", clearPreview);
    setMode("upload");
  });

  $$("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var zone = $("[data-msg]", form);
      if (!zone) return;
      var file = $("#video-file", form);
      zone.hidden = false;
      zone.textContent = form.dataset.demo === "partenaire"
        ? "Demande enregistrée. La Coordination Nationale Miss RDC revient vers vous sous 72 heures ouvrées."
        : file && file.files.length
          ? "Dossier enregistré avec votre vidéo. Vous recevrez un accusé de réception par e-mail avec le règlement du concours."
          : "Dossier enregistré. Vous recevrez un accusé de réception par e-mail avec le règlement du concours.";
      zone.scrollIntoView({ behavior: "smooth", block: "center" });
      form.reset();
    });
  });

  /* calendrier : étapes passées et prochaine étape */
  (function () {
    var now = Date.now(), next = null;
    $$(".agenda-row[data-date]").forEach(function (row) {
      var end = new Date(row.getAttribute("data-date") + "T23:59:59+01:00").getTime();
      if (end < now) row.classList.add("is-past");
      else if (!next) { next = row; row.classList.add("is-next"); }
    });
  })();

  window.__mrdcReady = true;
  if (!motion) return;

  /* ==================================================================
     À partir d'ici : animations
     ================================================================== */
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });

  /* ---------- Défilement fluide ---------- */
  if (window.Lenis && fine) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ancres internes */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.6 });
      else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Voile rapide entre les pages ---------- */
  var curtain = $(".curtain");

  function arrive(done) {
    if (!curtain || !html.classList.contains("is-arriving")) { done && done(); return; }
    gsap.set(curtain, { xPercent: 0 });
    html.classList.remove("is-arriving");
    gsap.to(curtain, {
      xPercent: 105, duration: .5, ease: "power3.inOut",
      onComplete: function () { gsap.set(curtain, { xPercent: -105 }); done && done(); }
    });
  }

  if (curtain) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto|tel):/i.test(href) || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (url.protocol !== location.protocol || url.host !== location.host) return;
      if (!/\.html?$/.test(url.pathname) && url.pathname.slice(-1) !== "/") return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      setMenu(false);
      try { sessionStorage.setItem("mrdc-curtain", "1"); } catch (err) {}
      gsap.fromTo(curtain, { xPercent: -105 }, {
        xPercent: 0, duration: .36, ease: "power3.inOut",
        onComplete: function () { location.href = url.href; }
      });
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { gsap.set(curtain, { xPercent: -105 }); html.classList.remove("is-arriving"); }
    });
  }

  /* ---------- Titres découpés en lignes ---------- */
  function splitLines(el, vars) {
    if (!window.SplitText) { gsap.set(el, { visibility: "visible" }); return null; }
    var anim = null;
    window.SplitText.create(el, {
      type: "lines", mask: "lines", linesClass: "sl", autoSplit: true,
      onSplit: function (self) {
        gsap.set(el, { visibility: "visible" });
        anim = gsap.from(self.lines, Object.assign({ yPercent: 115, duration: 1.4, stagger: .1 }, vars || {}));
        return anim;
      }
    });
    return anim;
  }

  /* ---------- Hero de l'accueil ---------- */
  function heroIntro() {
    var hero = $(".hero");
    if (!hero) return;
    var title = $$("[data-split='hero']", hero);
    var vid = $(".hero-media", hero);
    var tl = gsap.timeline();
    tl.fromTo(vid, { scale: 1.18, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: "expo.out" }, 0);
    title.forEach(function (t, i) {
      gsap.set(t, { visibility: "visible" });
      if (window.SplitText) {
        var s = window.SplitText.create(t, { type: "lines, chars", mask: "lines", linesClass: "sl" });
        tl.from(s.chars, { yPercent: 120, duration: 1.5, stagger: .035, ease: "expo.out" }, .25 + i * .18);
      }
    });
    var logo = $("[data-hero-logo]", hero);
    if (logo) {
      var logoStartScale = window.innerWidth <= 640 ? 1.04 : 1.12;
      tl.fromTo(logo, { opacity: 0, scale: logoStartScale, filter: "blur(18px) brightness(1.6)" }, { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", duration: 2.2, ease: "expo.out" }, .2);
    }
    tl.to($$("[data-hero]", hero), { opacity: 1, y: 0, duration: 1.4, stagger: .1, startAt: { y: 24 } }, .9);

    /* sortie au défilement, réservée aux appareils précis */
    if (fine) {
      gsap.to($(".hero-body", hero), { yPercent: -18, opacity: .15, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to($("video, img", vid), { scale: 1.12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }
  }

  /* ---------- En-tête des pages intérieures ---------- */
  function pageHeroIntro() {
    var ph = $(".page-hero") || $("[data-intro]");
    if (!ph) return;
    var img = ph.classList.contains("page-hero") ? $(".page-hero-media img", ph) : null;
    var tl = gsap.timeline();
    if (img) {
      tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0);
      gsap.to(img, { yPercent: 14, ease: "none", scrollTrigger: { trigger: ph, start: "top top", end: "bottom top", scrub: true } });
    }
    $$("[data-split='hero']", ph).forEach(function (t) {
      gsap.set(t, { visibility: "visible" });
      if (window.SplitText) {
        var s = window.SplitText.create(t, { type: "lines", mask: "lines", linesClass: "sl" });
        tl.from(s.lines, { yPercent: 115, duration: 1.5, stagger: .12 }, .2);
      }
    });
    tl.to($$("[data-hero]", ph), { opacity: 1, y: 0, duration: 1.3, stagger: .1, startAt: { y: 24 } }, .6);
  }

  /* ---------- Révélations génériques ---------- */
  function reveals() {
    $$("[data-split]:not([data-split='hero'])").forEach(function (el) {
      if (el.closest(".hero, .page-hero")) return;
      splitLines(el, { scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    ST.batch("[data-reveal]", {
      start: "top 90%",
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.3, stagger: .09, overwrite: true }); }
    });

    $$("[data-clip]").forEach(function (el) {
      var img = $("img, video", el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } });
      tl.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut" });
      if (img && !el.hasAttribute("data-parallax")) tl.from(img, { scale: 1.35, duration: 2, ease: "expo.out" }, 0);
    });

    $$("[data-parallax]").forEach(function (el) {
      var img = $("img", el);
      if (!img || !fine) return;
      var amt = parseFloat(el.getAttribute("data-parallax")) || 10;
      gsap.fromTo(img, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    $$("[data-words]").forEach(function (el) {
      if (!window.SplitText) return;
      var s = window.SplitText.create(el, { type: "words", wordsClass: "word" });
      gsap.fromTo(s.words, { opacity: .14 }, { opacity: 1, ease: "none", stagger: .1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
    });

    $$("[data-count]").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-count"));
      var from = parseFloat(el.getAttribute("data-from") || "0");
      var o = { v: from };
      ST.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function () {
          el.textContent = from;
          gsap.to(o, { v: to, duration: 2.2, ease: "expo.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
        }
      });
    });

    $$("[data-line]").forEach(function (el) {
      gsap.from(el, { scaleX: 0, transformOrigin: "left", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 92%" } });
    });
  }

  /* ---------- Couronne épinglée ---------- */
  function crown() {
    var sec = $(".crown");
    if (!sec) return;
    var stage = $(".crown-stage", sec);
    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (min-height: 701px) and (hover: hover) and (pointer: fine)", function () {
      var tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: "+=110%", pin: true, scrub: 1 } });
      tl.fromTo(".crown-img", { scale: .6, rotate: -8, yPercent: 10 }, { scale: 1, rotate: 0, yPercent: 0, ease: "none" }, 0)
        .fromTo(".crown-glow", { scale: .4, opacity: 0 }, { scale: 1.1, opacity: 1, ease: "none" }, 0)
        .fromTo(".crown-bg img", { scale: 1.2 }, { scale: 1, ease: "none" }, 0)
        .fromTo(".crown-name", { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "none" }, .45);
    });
    mm.add("(max-width: 900px), (max-height: 700px), (hover: none), (pointer: coarse)", function () {
      gsap.fromTo(".crown-img", { scale: .7, rotate: -6 }, { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "center center", scrub: true } });
    });
  }

  /* ---------- Lignée : défilement horizontal ---------- */
  function lineage() {
    var pin = $(".lineage-pin");
    if (!pin) return;
    var track = $(".lineage-track", pin);
    var bar = $(".lineage-progress i");
    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (min-height: 701px) and (hover: hover) and (pointer: fine)", function () {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true }
      });
      if (bar) gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: function () { return "+=" + dist(); }, scrub: true } });
      $$(".queen .media img", track).forEach(function (img) {
        gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img.parentNode, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });
  }

  /* ---------- Parcours : image au survol ---------- */
  function journeyHover() {
    var list = $(".journey-list");
    if (!list || !fine) return;
    var steps = $$(".step[data-img]", list);
    if (!steps.length) return;
    var box = document.createElement("div");
    box.className = "hover-img";
    box.setAttribute("aria-hidden", "true");
    steps.forEach(function (s) {
      var i = new Image();
      i.src = s.getAttribute("data-img");
      i.alt = "";
      box.appendChild(i);
    });
    document.body.appendChild(box);
    var imgs = $$("img", box);
    var xTo = gsap.quickTo(box, "x", { duration: .7, ease: "power3" });
    var yTo = gsap.quickTo(box, "y", { duration: .7, ease: "power3" });
    var rTo = gsap.quickTo(box, "rotate", { duration: .9, ease: "power3" });
    var px = 0;
    list.addEventListener("mousemove", function (e) {
      xTo(e.clientX + 30);
      yTo(e.clientY - box.offsetHeight / 2);
      rTo(Math.max(-8, Math.min(8, (e.clientX - px) * .4)));
      px = e.clientX;
    });
    steps.forEach(function (s, k) {
      s.addEventListener("mouseenter", function () {
        box.classList.add("is-on");
        imgs.forEach(function (im, j) { im.classList.toggle("is-on", j === k); });
      });
    });
    list.addEventListener("mouseleave", function () { box.classList.remove("is-on"); });
  }

  /* ---------- Film qui s'ouvre au défilement ---------- */
  function filmOpen() {
    if (!fine) return;
    $$("[data-film] .film-frame").forEach(function (frame) {
      gsap.fromTo(frame, { clipPath: "inset(10% 16% 10% 16%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: frame, start: "top 95%", end: "center 55%", scrub: true }
      });
      var v = $("video", frame);
      gsap.fromTo(v, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top 95%", end: "center 55%", scrub: true } });
    });
  }

  /* ---------- Curseur & boutons aimantés ---------- */
  function pointer() {
    if (!fine) return;
    var cur = document.createElement("div");
    cur.className = "cursor";
    cur.innerHTML = "<span></span>";
    document.body.appendChild(cur);
    var label = $("span", cur);
    var cx = gsap.quickTo(cur, "x", { duration: .45, ease: "power3" });
    var cy = gsap.quickTo(cur, "y", { duration: .45, ease: "power3" });
    window.addEventListener("mousemove", function (e) { cur.classList.add("is-on"); cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.classList.remove("is-on"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest && e.target.closest("[data-cursor], a, button, summary, label[for], select");
      if (!t) { cur.classList.remove("is-label", "is-link"); return; }
      if (t.hasAttribute("data-cursor")) {
        label.textContent = t.getAttribute("data-cursor");
        cur.classList.add("is-label"); cur.classList.remove("is-link");
      } else {
        cur.classList.add("is-link"); cur.classList.remove("is-label");
      }
    });

    $$("[data-magnetic]").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: .6, ease: "power3" });
      var my = gsap.quickTo(el, "y", { duration: .6, ease: "power3" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .4);
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, .4)" });
      });
    });
  }

  /* ---------- Pied de page ---------- */
  function footer() {
    var w = $(".foot-word");
    if (w) gsap.fromTo(w, { xPercent: 12 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  /* ---------- Démarrage ---------- */
  function start() {
    reveals();
    crown();
    lineage();
    journeyHover();
    filmOpen();
    pointer();
    footer();
    pageHeroIntro();
    ST.refresh();
  }

  arrive();
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var timeout = new Promise(function (r) { setTimeout(r, 600); });
  Promise.race([fonts, timeout]).then(function () {
    if ($(".hero")) heroIntro();
    start();
    window.addEventListener("load", function () { ST.refresh(); });
  });
})();
