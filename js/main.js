/* 汤辉元个人网站 · 交互脚本 */
(function () {
  "use strict";

  /* ---------- 主题切换 ---------- */
  var body = document.body;
  try {
    if (localStorage.getItem("th-theme") === "dark") body.classList.add("dark");
  } catch (e) {}
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      body.classList.toggle("dark");
      try { localStorage.setItem("th-theme", body.classList.contains("dark") ? "dark" : "light"); } catch (e) {}
    });
  }

  /* ---------- 页头滚动态 ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 固定网格线 ---------- */
  var grid = document.createElement("div");
  grid.className = "gridlines";
  for (var i = 0; i < 6; i++) grid.appendChild(document.createElement("span"));
  document.body.prepend(grid);

  /* ---------- 蓝点：网格锚定 + 静止漂浮 + 鼠标视差 ---------- */
  var dotsLayer = document.createElement("div");
  dotsLayer.className = "dots";
  document.body.prepend(dotsLayer);

  var dots = [];
  var DOT_COUNT = 11;
  function seedDots() {
    dotsLayer.innerHTML = "";
    dots = [];
    var w = window.innerWidth, h = window.innerHeight;
    for (var i = 0; i < DOT_COUNT; i++) {
      var el = document.createElement("div");
      el.className = "dot";
      var bx = (Math.random() * 0.92 + 0.04) * w;
      var by = (Math.random() * 0.86 + 0.06) * h;
      el.style.left = bx + "px";
      el.style.top = by + "px";
      dotsLayer.appendChild(el);
      dots.push({
        el: el, bx: bx, by: by,
        amp: 6 + Math.random() * 14,
        speed: 0.0004 + Math.random() * 0.0005,
        phase: Math.random() * Math.PI * 2,
        depth: 0.015 + Math.random() * 0.05,
        drift: Math.random() * Math.PI * 2
      });
    }
  }
  seedDots();
  window.addEventListener("resize", seedDots);

  var mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("mousemove", function (e) {
    tmx = (e.clientX / window.innerWidth - 0.5) * 2;
    tmy = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function tick(t) {
    mx += (tmx - mx) * 0.04;
    my += (tmy - my) * 0.04;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var x = Math.sin(t * d.speed + d.phase) * d.amp + Math.sin(t * 0.00013 + d.drift) * 8;
      var y = Math.cos(t * d.speed * 0.8 + d.phase) * d.amp;
      x += mx * d.depth * 100;
      y += my * d.depth * 60;
      d.el.style.transform = "translate(" + x + "px," + y + "px)";
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- 全屏菜单 ---------- */
  var overlay = document.querySelector(".menu-overlay");
  var openBtn = document.querySelector(".menu-btn");
  var closeBtn = document.querySelector(".menu-close");
  var projToggle = document.querySelector(".toggle-projects");
  var projSub = document.querySelector(".menu-sub");

  function openMenu() {
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (openBtn) openBtn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });
  if (overlay) {
    overlay.querySelectorAll(".menu-item > a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  if (projToggle && projSub) {
    projToggle.addEventListener("click", function (e) {
      e.preventDefault();
      var open = projSub.style.display === "block";
      projSub.style.display = open ? "none" : "block";
    });
  }

  /* 菜单项沿弧线排布 */
  function layoutMenu() {
    if (!overlay) return;
    var items = overlay.querySelectorAll(".menu-item");
    var W = window.innerWidth, H = window.innerHeight;
    // 弧线：圆心在左侧屏幕外，半径随视口自适应
    var cx = -W * 0.35, cy = H * 0.52;
    var r = W * 0.98;
    var start = -0.32, end = 0.34;
    items.forEach(function (item, i) {
      var k = items.length === 1 ? 0.5 : i / (items.length - 1);
      var ang = start + (end - start) * k;
      var x = cx + r * Math.cos(ang);
      var y = cy + r * Math.sin(ang);
      item.style.left = Math.max(W * 0.08, Math.min(x, W * 0.86)) + "px";
      item.style.top = Math.max(H * 0.08, Math.min(y, H * 0.88)) + "px";
    });
  }
  layoutMenu();
  window.addEventListener("resize", layoutMenu);

  /* ---------- 鼠标跟随作品预览图（Hero 区） ---------- */
  var previewImgs = document.querySelectorAll(".cursor-img img");
  var cursorBox = document.querySelector(".cursor-img");
  if (cursorBox && previewImgs.length) {
    var px = 0, py = 0, tx = 0, ty = 0;
    var cur = 0, lastSwap = 0, idleTimer = null, active = false;
    var heroZone = document.querySelector("[data-cursor-preview]");

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!heroZone) return;
      var r = heroZone.getBoundingClientRect();
      var inside = e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
      if (inside && !active) {
        active = true;
        cursorBox.classList.add("show");
      }
      if (active) {
        if (Date.now() - lastSwap > 650) {
          lastSwap = Date.now();
          previewImgs.forEach(function (im, i) { im.classList.toggle("current", i === cur); });
          cur = (cur + 1) % previewImgs.length;
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
          active = false;
          cursorBox.classList.remove("show");
        }, 1400);
      }
    }, { passive: true });

    (function followLoop() {
      px += (tx - px) * 0.09;
      py += (ty - py) * 0.09;
      cursorBox.style.left = px + "px";
      cursorBox.style.top = py + "px";
      requestAnimationFrame(followLoop);
    })();
  }

  /* ---------- 滚动入场 ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
