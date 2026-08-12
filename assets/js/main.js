(function () {
  "use strict";

  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".menu");
  var darkTop = !!document.querySelector(".hero, .phead");

  function onScroll() {
    if (!nav) return;
    var solid = window.scrollY > 36;
    nav.classList.toggle("is-solid", solid);
    if (darkTop) nav.classList.toggle("is-hero", !solid);
  }
  if (darkTop && nav) nav.classList.add("is-hero");
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  var reveals = document.querySelectorAll(".rev");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
    );
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 5, 4) * 55 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  var cd = document.querySelector("[data-countdown]");
  if (cd) {
    var cible = new Date("2026-12-05T20:00:00+01:00").getTime();
    var champs = {
      j: cd.querySelector('[data-u="j"]'),
      h: cd.querySelector('[data-u="h"]'),
      m: cd.querySelector('[data-u="m"]'),
      s: cd.querySelector('[data-u="s"]')
    };
    var pad = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    var tick = function () {
      var d = cible - Date.now();
      if (d < 0) d = 0;
      if (champs.j) champs.j.textContent = Math.floor(d / 864e5);
      if (champs.h) champs.h.textContent = pad(Math.floor((d % 864e5) / 36e5));
      if (champs.m) champs.m.textContent = pad(Math.floor((d % 36e5) / 6e4));
      if (champs.s) champs.s.textContent = pad(Math.floor((d % 6e4) / 1e3));
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------
     Hero — la main tire les photos une à une depuis l'arrière du panneau
     ------------------------------------------------------------------ */
  var stage = document.querySelector("[data-hero-pull]");
  if (stage) {
    var deck = stage.querySelector(".hero-deck");
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".pull"));
    var hand = stage.querySelector(".hero-hand");
    var dotsWrap = stage.querySelector(".hero-dots");
    var counter = document.querySelector("[data-slide-current]");
    var panel = document.querySelector(".hero-panel");

    /* point de pince dans l'image de la main, en fraction de sa largeur/hauteur */
    var PINCH_X = 0.062;
    var PINCH_Y = 0.315;
    var HAND_RATIO = 723 / 977;

    var PULL = 1700;   /* durée du tirage */
    var HOLD = 240;    /* la main lâche */
    var BACK = 820;    /* retour derrière le panneau */
    var TOTAL = PULL + HOLD + BACK;
    var DWELL = 3200;  /* temps d'affichage avant la photo suivante */

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canAnimate = typeof Element.prototype.animate === "function" && !reduced;

    var index = 0;
    var busy = false;
    var timer = null;
    var paused = false;
    var g = { start: 0, pinch: 0, handTop: 0 };

    function resetHand() {
      if (!hand) return;
      hand.getAnimations().forEach(function (a) { a.cancel(); });
      hand.style.opacity = "0";
      hand.style.transform = "translate3d(-9999px,0,0)";
    }

    function measure() {
      var sw = stage.clientWidth;
      var sh = stage.clientHeight;
      var desktop = window.innerWidth > 880 && panel;
      var handW = Math.max(230, Math.min(sw * 0.38, 560));
      var handH = handW * HAND_RATIO;

      if (hand) {
        hand.style.width = handW + "px";
        /* avant-bras sous le cadre — la coupure de l'image reste invisible */
        g.handTop = Math.max(sh * 0.64 - handH * PINCH_Y, sh - handH + 90);
        hand.style.top = g.handTop + "px";
      }

      /* départ : le bord gauche de la photo est caché derrière le panneau blanc */
      var hideLine = sw;
      if (desktop) {
        var pr = panel.getBoundingClientRect();
        var sr = stage.getBoundingClientRect();
        hideLine = Math.max(sw * 0.5, pr.left - sr.left + 36);
      }
      g.start = hideLine;
      g.pinch = handW * PINCH_X;
    }

    function stackCards(active) {
      cards.forEach(function (c, k) {
        c.style.zIndex = k === active ? "3" : "1";
      });
    }

    function park(card) {
      card.style.transform = "translate3d(" + g.start + "px,0,0)";
      card.classList.remove("is-live");
    }

    function settle(card) {
      card.style.transform = "translate3d(0,0,0)";
    }

    function paintUi(n) {
      if (counter) counter.textContent = String(n + 1);
      if (!dotsWrap) return;
      Array.prototype.forEach.call(dotsWrap.children, function (b, k) {
        b.classList.toggle("is-active", k === n);
        b.setAttribute("aria-selected", k === n ? "true" : "false");
      });
    }

    function show(n, instant) {
      n = (n + cards.length) % cards.length;
      if (busy) return;
      if (!instant && n === index) return;
      busy = true;
      measure();

      var card = cards[n];
      var prev = index;
      index = n;
      paintUi(n);

      card.style.zIndex = "3";
      stackCards(n);
      cards.forEach(function (c) {
        c.getAnimations && c.getAnimations().forEach(function (a) { a.cancel(); });
      });
      resetHand();

      if (!canAnimate || instant) {
        if (prev >= 0 && cards[prev] && prev !== n) park(cards[prev]);
        settle(card);
        card.classList.add("is-live");
        busy = false;
        armNext();
        return;
      }

      park(card);
      card.classList.add("is-live");

      var pullEnd = PULL / TOTAL;
      var holdEnd = (PULL + HOLD) / TOTAL;
      var ease = "cubic-bezier(.5,.04,.24,1)";

      var cardAnim = card.animate(
        [
          { offset: 0, transform: "translate3d(" + g.start + "px,0,0) rotate(1deg) scale(1.03)", easing: ease },
          { offset: pullEnd, transform: "translate3d(0,0,0) rotate(0deg) scale(1)" },
          { offset: 1, transform: "translate3d(0,0,0) rotate(0deg) scale(1)" }
        ],
        { duration: TOTAL, fill: "none" }
      );

      if (hand) {
        var S = g.start - g.pinch;
        var E = -g.pinch;
        hand.style.opacity = "1";
        hand.style.transform = "translate3d(" + S + "px,0,0) rotate(-3deg)";
        var handAnim = hand.animate(
          [
            { offset: 0, transform: "translate3d(" + S + "px,0,0) rotate(-3deg)", opacity: 1, easing: ease },
            { offset: pullEnd, transform: "translate3d(" + E + "px,0,0) rotate(0deg)", opacity: 1, easing: "cubic-bezier(.4,0,.7,.3)" },
            { offset: holdEnd, transform: "translate3d(" + (E - 8) + "px,0,0) rotate(-6deg)", opacity: 1, easing: "cubic-bezier(.5,0,.75,.4)" },
            { offset: 0.92, transform: "translate3d(" + (S * 0.78) + "px,0,0) rotate(-3deg)", opacity: 1 },
            { offset: 1, transform: "translate3d(" + S + "px,0,0) rotate(-3deg)", opacity: 0 }
          ],
          { duration: TOTAL, fill: "none" }
        );
        handAnim.onfinish = resetHand;
        handAnim.oncancel = resetHand;
      }

      var done = false;
      function finishShow() {
        if (done) return;
        done = true;
        card.classList.remove("is-live");
        if (prev >= 0 && cards[prev] && prev !== n) park(cards[prev]);
        settle(card);
        stackCards(n);
        busy = false;
        armNext();
      }
      cardAnim.onfinish = finishShow;
      cardAnim.oncancel = finishShow;
      setTimeout(finishShow, TOTAL + 50);
    }

    function armNext() {
      clearTimeout(timer);
      if (!canAnimate || cards.length < 2 || paused) return;
      timer = setTimeout(function () {
        if (!busy && !paused) show((index + 1) % cards.length);
      }, DWELL);
    }

    function schedule() {
      armNext();
    }

    /* pastilles de navigation */
    if (dotsWrap && cards.length > 1) {
      dotsWrap.setAttribute("role", "tablist");
      dotsWrap.setAttribute("aria-label", "Photos du concours");
      dotsWrap.removeAttribute("aria-hidden");
      cards.forEach(function (_, k) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Photo " + (k + 1));
        b.setAttribute("aria-selected", k === 0 ? "true" : "false");
        if (k === 0) b.classList.add("is-active");
        b.addEventListener("click", function () {
          clearTimeout(timer);
          show(k);
        });
        dotsWrap.appendChild(b);
      });
    }

    measure();
    if (canAnimate) {
      index = -1;
      cards.forEach(park);
      paintUi(0);
      setTimeout(function () { show(0); }, 620);
    } else {
      stage.classList.add("no-hand");
      cards.forEach(function (c, k) {
        if (k === 0) { c.style.zIndex = "3"; settle(c); } else park(c);
      });
      paintUi(0);
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        measure();
        cards.forEach(function (c, k) { if (k !== index) park(c); else settle(c); });
      }, 160);
    });

    stage.addEventListener("mouseenter", function () { paused = true; clearTimeout(timer); });
    stage.addEventListener("mouseleave", function () { paused = false; armNext(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearTimeout(timer); } else { armNext(); }
    });
  }

  document.querySelectorAll("[data-video-field]").forEach(function (field) {
    var mode = "upload";
    var previewUrl = null;
    var btns = field.querySelectorAll("[data-video-mode]");
    var panels = field.querySelectorAll("[data-video-panel]");
    var fileInput = field.querySelector("#video-file");
    var urlInput = field.querySelector("#video");
    var drop = field.querySelector(".upload-drop");
    var preview = field.querySelector("[data-video-preview]");
    var player = field.querySelector("[data-video-player]");
    var clearBtn = field.querySelector("[data-video-clear]");

    function setMode(next) {
      mode = next;
      btns.forEach(function (btn) {
        var active = btn.dataset.videoMode === next;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.dataset.videoPanel !== next;
      });
      if (urlInput) urlInput.required = false;
      if (fileInput) fileInput.required = false;
    }

    function clearPreview() {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
      if (player) {
        player.removeAttribute("src");
        player.load();
      }
      if (fileInput) fileInput.value = "";
      if (preview) preview.hidden = true;
      if (drop) drop.hidden = false;
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.dataset.videoMode);
      });
    });

    if (fileInput) {
      fileInput.addEventListener("change", function () {
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
    }

    if (clearBtn) clearBtn.addEventListener("click", clearPreview);

    field.closest("form").addEventListener("reset", clearPreview);
    setMode("upload");
  });

  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var zone = form.querySelector("[data-msg]");
      if (!zone) return;

      var hasUpload = form.querySelector("#video-file") && form.querySelector("#video-file").files.length;
      zone.hidden = false;
      zone.textContent =
        form.dataset.demo === "partenaire"
          ? "Demande enregistrée. La Coordination Nationale Miss RDC revient vers vous sous 72 heures ouvrées."
          : hasUpload
            ? "Dossier enregistré avec votre vidéo. Vous recevrez un accusé de réception par e-mail avec le règlement du concours."
            : "Dossier enregistré. Vous recevrez un accusé de réception par e-mail avec le règlement du concours.";
      zone.scrollIntoView({ behavior: "smooth", block: "center" });
      form.reset();
    });
  });
})();
