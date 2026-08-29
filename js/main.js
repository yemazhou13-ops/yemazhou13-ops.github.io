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

  /* 菜单项：弧线排布 + 滚轮旋转木马；圆形视窗图片同步旋转 */
  var menuItems = overlay ? overlay.querySelectorAll(".menu-item") : [];
  var circleImg = overlay ? overlay.querySelector(".menu-circle img") : null;
  var ARC_START = -0.32, ARC_END = 0.34, ARC_SPAN = ARC_END - ARC_START;
  var arcOff = 0, arcTarget = 0, imgRot = 0, rotTarget = 0;
  var entranceDone = false, lastTouchY = null;

  function layoutMenu() {
    if (!overlay) return;
    var W = window.innerWidth, H = window.innerHeight;
    var cx = -W * 0.35, cy = H * 0.52, r = W * 0.98;
    menuItems.forEach(function (item, i) {
      var k = menuItems.length === 1 ? 0.5 : i / (menuItems.length - 1);
      var ang = ARC_START + ARC_SPAN * k - arcOff;
      var x = cx + r * Math.cos(ang);
      var y = cy + r * Math.sin(ang);
      item.style.left = Math.max(W * 0.08, Math.min(x, W * 0.86)) + "px";
      item.style.top = Math.max(H * 0.08, Math.min(y, H * 0.88)) + "px";
      if (entranceDone && W > 900) {
        var fade = Math.max(0, Math.min(1,
          Math.min((ang - (ARC_START - 0.14)) / 0.14, ((ARC_END + 0.14) - ang) / 0.14)));
        item.style.opacity = fade;
        item.style.visibility = fade <= 0.01 ? "hidden" : "visible";
      }
    });
  }
  layoutMenu();
  window.addEventListener("resize", layoutMenu);

  function menuLoop() {
    if (overlay && overlay.classList.contains("open")) {
      arcOff += (arcTarget - arcOff) * 0.08;
      imgRot += (rotTarget - imgRot) * 0.07;
      if (circleImg) circleImg.style.transform = "scale(1.32) rotate(" + imgRot.toFixed(2) + "deg)";
      layoutMenu();
    }
    requestAnimationFrame(menuLoop);
  }
  requestAnimationFrame(menuLoop);

  function onMenuScroll(delta) {
    rotTarget = Math.max(-28, Math.min(28, rotTarget + delta * 0.12));
    arcTarget = Math.max(0, Math.min(ARC_SPAN, arcTarget + delta * 0.0012));
  }
  if (overlay) {
    overlay.addEventListener("wheel", function (e) {
      e.preventDefault();
      onMenuScroll(e.deltaY);
    }, { passive: false });
    overlay.addEventListener("touchmove", function (e) {
      var y = e.touches[0].clientY;
      if (lastTouchY !== null) onMenuScroll((lastTouchY - y) * 2.2);
      lastTouchY = y;
    }, { passive: true });
    overlay.addEventListener("touchend", function () { lastTouchY = null; });
  }
  if (openBtn) openBtn.addEventListener("click", function () {
    entranceDone = false;
    arcTarget = 0; arcOff = 0; rotTarget = 0;
    menuItems.forEach(function (item) {
      item.style.opacity = ""; item.style.visibility = "";
    });
    setTimeout(function () { entranceDone = true; }, 1000);
    openMenu();
  });

  /* ---------- Hero 拖尾浮图：移动时在鼠标处生成、原地淡出 ---------- */
  var heroZone = document.querySelector("[data-cursor-preview]");
  if (heroZone) {
    var pool = [];
    try { pool = JSON.parse(heroZone.getAttribute("data-trail")) || []; } catch (e) {}
    if (!pool.length) pool = ["assets/lhz-01-cover.jpg"];
    var lastSpawn = 0, poolIdx = 0, idleT = null, heroActive = false, alive = 0;
    var MAX_ALIVE = 3, SPAWN_GAP = 340;

    window.addEventListener("mousemove", function (e) {
      var r = heroZone.getBoundingClientRect();
      var inside = e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside && !heroActive) { heroActive = true; }
      if (!heroActive) return;
      /* 顶部导航条与右下角按钮区不生成浮图，避免遮挡 MENU / 开始合作 */
      var nearHeader = e.clientY < 100;
      var nearCorner = e.clientY > window.innerHeight - 96 && e.clientX > window.innerWidth - 340;
      if (Date.now() - lastSpawn > SPAWN_GAP && alive < MAX_ALIVE && !nearHeader && !nearCorner) {
        lastSpawn = Date.now();
        alive++;
        var el = document.createElement("div");
        el.className = "trail-img " + (Math.random() > 0.5 ? "tl-l" : "tl-p");
        el.style.setProperty("--tilt", (Math.random() * 14 - 7).toFixed(1) + "deg");
        el.style.left = e.clientX + "px";
        el.style.top = e.clientY + "px";
        var im = document.createElement("img");
        im.src = pool[poolIdx % pool.length];
        poolIdx++;
        el.appendChild(im);
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); alive--; }, 1250);
      }
      clearTimeout(idleT);
      idleT = setTimeout(function () { heroActive = false; }, 900);
    }, { passive: true });
  }

  /* ---------- 项目索引行：悬停浮出预览图 ---------- */
  var rows = document.querySelectorAll("[data-preview]");
  if (rows.length) {
    var box = document.createElement("div");
    box.className = "row-preview";
    box.innerHTML = '<img alt="">';
    document.body.appendChild(box);
    var boxImg = box.querySelector("img");
    var bx = 0, by = 0, btx = 0, bty = 0, boxOn = false;

    window.addEventListener("mousemove", function (e) {
      btx = e.clientX; bty = e.clientY;
    }, { passive: true });

    (function boxLoop() {
      bx += (btx - bx) * 0.14;
      by += (bty - by) * 0.14;
      if (boxOn) { box.style.left = bx + "px"; box.style.top = by + "px"; }
      requestAnimationFrame(boxLoop);
    })();

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        boxImg.src = row.getAttribute("data-preview");
        bx = btx; by = bty;
        box.classList.add("show");
        boxOn = true;
      });
      row.addEventListener("mouseleave", function () {
        box.classList.remove("show");
        boxOn = false;
      });
    });
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
