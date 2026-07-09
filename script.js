/* ============================================================
   ULLO — Ulleungdo Botanicals · App logic
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Data ---------- */
  const PRODUCTS = [
    {
      id: "cleansing",
      name: "Sambaekrihyang Cleansing Foam",
      short: "Cleansing Foam",
      sub: "Purifying & Refreshing",
      size: "150 ml / 5.7 fl oz",
      price: 16900,
      was: 19900,
      img: "assets/images/cleansing.png",
      best: true,
    },
    {
      id: "toner",
      name: "Sambaekrihyang Balancing Toner",
      short: "Toner",
      sub: "Hydrating & Soothing",
      size: "200 ml / 6.76 fl oz",
      price: 21900,
      was: 24900,
      img: "assets/images/toner.png",
      best: true,
    },
    {
      id: "ampoule",
      name: "Ulsan Cabbage Ampoule",
      short: "Ampoule",
      sub: "Nourishing & Firming",
      size: "30 ml / 1.01 fl oz",
      price: 32900,
      was: 38000,
      img: "assets/images/ampoule.png",
      best: false,
    },
    {
      id: "cream",
      name: "Native Botanical Cream",
      short: "Cream",
      sub: "Nourishing & Barrier Care",
      size: "50 ml / 1.69 fl oz",
      price: 28900,
      was: 33000,
      img: "assets/images/cream.png",
      best: false,
    },
  ];

  const STORY = {
    feature: {
      title: "Botanical Traits",
      body:
        "Sambaekrihyang (삼백리향) is a wild creeping thyme endemic to Ulleungdo. Its tiny leaves store aromatic oils rich in antioxidants, prized for calming and refreshing sensitive skin. It hugs the volcanic soil in dense mats, releasing a soft herbal scent when brushed.",
      facts: [
        { b: "0.5 cm", s: "Leaf length" },
        { b: "5–7", s: "Bloom months" },
        { b: "12+", s: "Aroma compounds" },
      ],
    },
    habitat: {
      title: "Where It Grows",
      body:
        "Rooted in the mineral-rich basalt cliffs of Ulleungdo, this thyme thrives in salt-laden sea winds and volcanic soil. The isolated island climate concentrates its actives — the same resilience we capture in every ULLO formula.",
      facts: [
        { b: "984 m", s: "Peak altitude" },
        { b: "37.5°N", s: "Latitude" },
        { b: "Basalt", s: "Native soil" },
      ],
    },
  };

  /* Stylized top-down creeping-thyme illustration (inline SVG) */
  const PLANT_SVG = `
    <svg viewBox="0 0 190 190" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mg" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="#6fae5c"/><stop offset="70%" stop-color="#4d8f43"/><stop offset="100%" stop-color="#3a6f34"/>
        </radialGradient>
      </defs>
      <circle cx="95" cy="95" r="78" fill="url(#mg)"/>
      <g fill="#3f7c37" opacity="0.9">
        ${Array.from({ length: 46 })
          .map((_, i) => {
            const a = (i * 137.5 * Math.PI) / 180;
            const r = 10 + (i / 46) * 66;
            const x = 95 + Math.cos(a) * r;
            const y = 95 + Math.sin(a) * r;
            const s = 3 + (1 - i / 46) * 4;
            return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${s.toFixed(1)}" ry="${(s * 1.7).toFixed(1)}" transform="rotate(${(i * 47) % 360} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
          })
          .join("")}
      </g>
      <g>
        ${Array.from({ length: 26 })
          .map((_, i) => {
            const a = (i * 99.5 * Math.PI) / 180;
            const r = 16 + (i / 26) * 60;
            const x = 95 + Math.cos(a) * r;
            const y = 95 + Math.sin(a) * r;
            return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
              ${[0, 72, 144, 216, 288]
                .map(
                  (d) =>
                    `<ellipse cx="0" cy="-3.4" rx="1.7" ry="3.1" fill="#d98cc0" transform="rotate(${d})"/>`
                )
                .join("")}
              <circle r="1.5" fill="#f3d75a"/>
            </g>`;
          })
          .join("")}
      </g>
    </svg>`;

  /* ---------- State ---------- */
  const state = {
    current: "detail",
    activeProduct: PRODUCTS[0],
    qty: 1,
    cart: [], // {id, qty}
    filter: "all",
    tab: "feature",
  };

  /* ---------- Helpers ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const won = (n) => "₩" + n.toLocaleString("en-US");
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ---------- Router ---------- */
  const screens = {};
  $$(".screen").forEach((s) => (screens[s.dataset.screen] = s));

  function go(name) {
    if (name === state.current || !screens[name]) return;
    const from = screens[state.current];
    const to = screens[name];
    from.classList.add("is-leaving");
    from.classList.remove("is-active");
    to.classList.add("is-active");
    setTimeout(() => from.classList.remove("is-leaving"), 500);
    state.current = name;
    // scroll target screen to top (after it becomes visible)
    requestAnimationFrame(() => {
      to.querySelectorAll('[class*="-scroll"]').forEach((sc) => (sc.scrollTop = 0));
    });
    // hide the global tab bar on the home/detail screen (matches reference)
    $("#app").classList.toggle("on-detail", name === "detail");
    closePop();
    syncTabbar();
    if (navigator.vibrate) navigator.vibrate(6);
  }

  function syncTabbar() {
    $$(".tab").forEach((t) =>
      t.classList.toggle("is-active", t.dataset.nav === state.current)
    );
  }

  /* delegate all [data-nav] clicks */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-nav]");
    if (el) {
      go(el.dataset.nav);
    }
  });

  /* ---------- Detail screen ---------- */
  const heroImg = $("#heroImg");
  const elName = $("#detailName");
  const elSize = $("#detailSize");
  const elNow = $("#priceNow");
  const elQty = $("#qty");

  function loadProduct(p) {
    state.activeProduct = p;
    state.qty = 1;
    closePop();
    heroImg.style.opacity = "0";
    heroImg.style.transform = "translateY(20px) scale(.96)";
    setTimeout(() => {
      heroImg.src = p.img;
      heroImg.style.opacity = "1";
      heroImg.style.transform = "";
    }, 200);
    elName.textContent = p.name;
    elSize.textContent = p.size;
    updatePrice();
  }

  function updatePrice() {
    elQty.textContent = state.qty;
    elNow.textContent = won(state.activeProduct.price * state.qty);
  }

  function bump(el) {
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.16)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "cubic-bezier(.22,.61,.36,1)" }
    );
  }

  $("#plusBtn").addEventListener("click", () => {
    if (state.qty < 99) state.qty++;
    updatePrice();
    bump(elQty);
  });
  $("#minusBtn").addEventListener("click", () => {
    if (state.qty > 1) state.qty--;
    updatePrice();
    bump(elQty);
  });

  /* ---------- Drag-to-add slide button ----------
     Drag the right circular handle left onto the left target to add. */
  (function () {
    const btn = $("#addCartBtn");
    const handle = btn.querySelector(".cart-btn__ic--left");
    const targetIc = btn.querySelector(".cart-btn__ic--right");
    const label = btn.querySelector(".cart-btn__label");
    const THRESHOLD = 0.82;
    let dragging = false,
      startX = 0,
      dx = 0,
      travel = 0;

    const clientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    function apply(v) {
      dx = Math.max(0, Math.min(travel, v));
      handle.style.transform = "translateX(" + dx + "px)";
      const prog = travel ? dx / travel : 0;
      label.style.opacity = String(1 - Math.min(1, prog * 1.3));
      btn.classList.toggle("armed", prog >= THRESHOLD);
    }

    function doAdd() {
      addToCart(state.activeProduct.id, state.qty);
      toast("Added to cart");
    }

    function onDown(e) {
      dragging = true;
      // distance the handle must travel right to reach the right target
      travel = Math.max(0, targetIc.getBoundingClientRect().left - handle.getBoundingClientRect().left);
      startX = clientX(e) - dx;
      handle.style.transition = "none";
      label.style.transition = "none";
      btn.classList.add("is-dragging");
      handle.classList.add("dragging");
      if (e.pointerId != null && handle.setPointerCapture) {
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      }
    }

    function onMove(e) {
      if (!dragging) return;
      apply(clientX(e) - startX);
      if (e.cancelable) e.preventDefault();
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      btn.classList.remove("is-dragging");
      handle.classList.remove("dragging");
      const prog = travel ? dx / travel : 0;
      handle.style.transition = "transform .42s var(--ease-out)";
      label.style.transition = "opacity .3s var(--ease)";
      if (prog >= THRESHOLD) {
        // snap fully onto target, register the add, then glide back
        handle.style.transform = "translateX(" + travel + "px)";
        label.style.opacity = "0";
        doAdd();
        setTimeout(reset, 280);
      } else {
        reset();
      }
    }

    function reset() {
      dx = 0;
      handle.style.transform = "translateX(0)";
      label.style.opacity = "1";
      btn.classList.remove("armed");
    }

    if (window.PointerEvent) {
      handle.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    } else {
      handle.addEventListener("touchstart", onDown, { passive: false });
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
      handle.addEventListener("mousedown", onDown);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  })();

  /* ---------- Ingredient hotspots ---------- */
  const HOTSPOTS = [
    {
      title: "Sambaekrihyang Extract",
      body: "Wild Ulleungdo creeping thyme — antioxidant-rich, calms and refreshes skin.",
    },
    {
      title: "Micro-Foam Cleansing",
      body: "Dense airy lather lifts impurities without stripping the moisture barrier.",
    },
  ];
  const pop = $("#hotspotPop");
  const popTitle = $("#popTitle");
  const popBody = $("#popBody");
  let openHot = -1;

  function closePop() {
    if (!pop) return;
    pop.classList.remove("show");
    $$(".hotspot").forEach((h) => h.classList.remove("is-open"));
    openHot = -1;
  }

  function openPop(i, btn) {
    const data = HOTSPOTS[i];
    popTitle.textContent = data.title;
    popBody.textContent = data.body;
    // position popover under the hotspot, clamped to stage
    const stage = $("#heroStage");
    const sr = stage.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const w = 210;
    let left = br.left - sr.left + br.width / 2 - w / 2;
    left = Math.max(12, Math.min(left, sr.width - w - 12));
    const top = br.top - sr.top + br.height + 10;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
    pop.classList.add("show");
    $$(".hotspot").forEach((h) => h.classList.remove("is-open"));
    btn.classList.add("is-open");
    openHot = i;
  }

  $$(".hotspot").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const i = +btn.dataset.hotspot;
      if (openHot === i) closePop();
      else openPop(i, btn);
      if (navigator.vibrate) navigator.vibrate(6);
    });
  });
  // tap elsewhere closes popover (but not the "Learn more" nav)
  $("#heroStage").addEventListener("click", (e) => {
    if (!e.target.closest(".hotspot") && !e.target.closest(".hotspot-pop")) closePop();
  });

  /* ---------- Footer segmented control → products ---------- */
  $$("[data-goproducts]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter || "all";
      state.filter = f;
      $$(".pillnav__item").forEach((x) =>
        x.classList.toggle("is-active", x.dataset.filter === f)
      );
      // sync the products segmented control
      $$("#seg .seg__item").forEach((x) =>
        x.classList.toggle("is-active", x.dataset.filter === f)
      );
      renderGrid();
      go("products");
    });
  });

  /* ---------- Swipe left on hero → products ---------- */
  (function () {
    const stage = $("#heroStage");
    let x0 = null;
    stage.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (dx < -60) {
        state.filter = "all";
        go("products");
      }
      x0 = null;
    });
  })();

  /* ---------- Products grid ---------- */
  const grid = $("#grid");

  function renderGrid() {
    const list = PRODUCTS.filter((p) => state.filter === "all" || p.best);
    grid.innerHTML = list
      .map(
        (p) => `
      <article class="card" data-id="${p.id}">
        <button class="card__fav" data-fav="${p.id}" aria-label="Favorite">
          <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-9.2-8.4C1.2 8.9 2.6 5.5 6 5.5c2 0 3.2 1.3 4 2.4.8-1.1 2-2.4 4-2.4 3.4 0 4.8 3.4 3.2 6.1C19 15.4 12 20 12 20z"/></svg>
        </button>
        <div class="card__imgwrap"><img class="card__img" src="${p.img}" alt="${p.short}" loading="lazy"/></div>
        <h3 class="card__name">${p.short}</h3>
        <p class="card__sub">${p.sub}</p>
        <p class="card__price">${won(p.price)}</p>
      </article>`
      )
      .join("");

    // stagger reveal
    $$(".card", grid).forEach((c, i) => {
      setTimeout(() => c.classList.add("in"), 60 * i + 40);
    });

    // interactions
    $$(".card", grid).forEach((c) => {
      c.addEventListener("click", (e) => {
        if (e.target.closest(".card__fav")) return;
        const p = byId(c.dataset.id);
        loadProduct(p);
        go("detail");
      });
    });
    $$(".card__fav", grid).forEach((f) => {
      f.addEventListener("click", (e) => {
        e.stopPropagation();
        f.classList.toggle("on");
        if (navigator.vibrate) navigator.vibrate(8);
      });
    });
  }

  $$("#seg .seg__item").forEach((b) => {
    b.addEventListener("click", () => {
      $$("#seg .seg__item").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      state.filter = b.dataset.filter;
      // keep the home footer segmented control in sync
      $$(".pillnav__item").forEach((x) =>
        x.classList.toggle("is-active", x.dataset.filter === state.filter)
      );
      renderGrid();
    });
  });

  /* ---------- Story screen ---------- */
  $("#plant").innerHTML = PLANT_SVG;

  function renderStory() {
    const d = STORY[state.tab] || STORY.feature;
    const panel = $("#storyPanel");
    panel.style.opacity = "0";
    panel.style.transform = "translateY(10px)";
    setTimeout(() => {
      panel.innerHTML = `
        <h3>${d.title}</h3>
        <p>${d.body}</p>
        <div class="facts">
          ${d.facts.map((f) => `<div class="fact"><b>${f.b}</b><span>${f.s}</span></div>`).join("")}
        </div>`;
      panel.style.transition = "opacity .4s ease, transform .4s cubic-bezier(.16,1,.3,1)";
      panel.style.opacity = "1";
      panel.style.transform = "none";
    }, 120);
  }

  $$("#storyTabs .story-tab").forEach((t) => {
    t.addEventListener("click", () => {
      const tab = t.dataset.tab;
      if (tab === "next") {
        state.tab = state.tab === "feature" ? "habitat" : "feature";
      } else {
        state.tab = tab;
      }
      $$("#storyTabs .story-tab").forEach((x) =>
        x.classList.toggle("is-active", x.dataset.tab === state.tab)
      );
      renderStory();
    });
  });

  /* ---------- Cart ---------- */
  function addToCart(id, qty) {
    const found = state.cart.find((c) => c.id === id);
    if (found) found.qty += qty;
    else state.cart.push({ id, qty });
    renderCart();
    syncBadges();
  }
  function setQty(id, delta) {
    const item = state.cart.find((c) => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart = state.cart.filter((c) => c.id !== id);
    renderCart();
    syncBadges();
  }
  function removeItem(id) {
    state.cart = state.cart.filter((c) => c.id !== id);
    renderCart();
    syncBadges();
  }

  function cartCount() {
    return state.cart.reduce((s, c) => s + c.qty, 0);
  }
  function cartTotal() {
    return state.cart.reduce((s, c) => s + byId(c.id).price * c.qty, 0);
  }

  function syncBadges() {
    const n = cartCount();
    ["cartBadgeTop", "cartBadgeTab"].forEach((id) => {
      const el = $("#" + id);
      if (!el) return;
      el.textContent = n;
    });
    const tabBadge = $("#cartBadgeTab");
    tabBadge.classList.toggle("show", n > 0);
    const topBadge = $("#cartBadgeTop");
    topBadge.style.display = n > 0 ? "grid" : "none";
  }

  function renderCart() {
    const list = $("#cartList");
    const empty = $("#cartEmpty");
    const foot = $("#cartFoot");
    if (state.cart.length === 0) {
      list.innerHTML = "";
      empty.classList.add("show");
      foot.classList.add("hide");
      return;
    }
    empty.classList.remove("show");
    foot.classList.remove("hide");
    list.innerHTML = state.cart
      .map((c) => {
        const p = byId(c.id);
        return `
        <div class="cart-item" data-id="${p.id}">
          <button class="cart-item__rm" data-rm="${p.id}" aria-label="Remove">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <div class="cart-item__img"><img src="${p.img}" alt="${p.short}"/></div>
          <div class="cart-item__info">
            <p class="cart-item__name">${p.short}</p>
            <p class="cart-item__sub">${p.sub}</p>
            <div class="cart-item__row">
              <span class="cart-item__price">${won(p.price * c.qty)}</span>
              <div class="cart-item__qty">
                <button data-dec="${p.id}" aria-label="Decrease">−</button>
                <span>${c.qty}</span>
                <button data-inc="${p.id}" aria-label="Increase">+</button>
              </div>
            </div>
          </div>
        </div>`;
      })
      .join("");
    $("#cartTotal").textContent = won(cartTotal());

    $$("[data-inc]", list).forEach((b) =>
      b.addEventListener("click", () => setQty(b.dataset.inc, 1))
    );
    $$("[data-dec]", list).forEach((b) =>
      b.addEventListener("click", () => setQty(b.dataset.dec, -1))
    );
    $$("[data-rm]", list).forEach((b) =>
      b.addEventListener("click", () => removeItem(b.dataset.rm))
    );
  }

  $("#checkoutBtn").addEventListener("click", () => {
    if (state.cart.length === 0) return;
    toast("Order placed 🎉");
    state.cart = [];
    renderCart();
    syncBadges();
    setTimeout(() => go("detail"), 700);
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    $("#toastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
    if (navigator.vibrate) navigator.vibrate(10);
  }

  /* ---------- Clock ---------- */
  function tickClock() {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    $("#clock").textContent = `${h}:${m}`;
  }

  /* ---------- Init ---------- */
  function init() {
    loadProduct(PRODUCTS[0]);
    renderGrid();
    renderStory();
    renderCart();
    syncBadges();
    syncTabbar();
    $("#app").classList.add("on-detail");
    tickClock();
    setInterval(tickClock, 15000);

    // reveal cards when Shop screen first shown
    document.addEventListener("click", (e) => {
      const nav = e.target.closest('[data-nav="products"]');
      if (nav) setTimeout(renderGrid, 120);
    });

    // hide loader
    window.addEventListener("load", () => {
      setTimeout(() => $("#loader").classList.add("hide"), 650);
    });
    // fallback in case load already fired
    setTimeout(() => $("#loader").classList.add("hide"), 1400);
  }

  init();
})();
