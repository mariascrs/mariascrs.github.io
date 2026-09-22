(function () {
  "use strict";

  /* ---------- Light / dark toggle ---------- */
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return media && media.matches ? "dark" : "light";
  }

  function labelToggle(btn) {
    var next = currentTheme() === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", "Switch to " + next + " theme");
    btn.setAttribute("title", "Switch to " + next + " theme");
  }

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    labelToggle(toggle);
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      labelToggle(toggle);
    });
    if (media && media.addEventListener) {
      media.addEventListener("change", function () { labelToggle(toggle); });
    }
  }

  /* ---------- Table of contents for posts ---------- */
  var body = document.querySelector(".post-body");
  var toc = document.querySelector(".toc");
  if (!body || !toc) return;

  var headings = Array.prototype.slice.call(body.querySelectorAll("h1[id], h2[id], h3[id]"));
  if (headings.length < 2) return;

  // Top level = the largest heading level the post uses; one level below it is nested.
  var levels = headings.map(function (h) { return +h.tagName.charAt(1); });
  var top = Math.min.apply(null, levels);
  headings = headings.filter(function (h) { return +h.tagName.charAt(1) <= top + 1; });
  if (headings.filter(function (h) { return +h.tagName.charAt(1) === top; }).length < 2) return;

  var list = toc.querySelector("ol");
  var links = [];
  var n = 0;
  headings.forEach(function (h) {
    var level = +h.tagName.charAt(1);
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + h.id;
    if (level === top) {
      n += 1;
      var num = document.createElement("span");
      num.className = "toc-num";
      num.textContent = n;
      a.appendChild(num);
    } else {
      li.className = "toc-sub";
    }
    var text = document.createElement("span");
    text.innerHTML = h.innerHTML; // keeps any $maths$ so MathJax can typeset it too
    a.appendChild(text);
    li.appendChild(a);
    list.appendChild(li);
    links.push({ a: a, h: h });
  });
  toc.hidden = false;

  // Highlight the section currently being read.
  function update() {
    var current = links[0];
    for (var i = 0; i < links.length; i++) {
      if (links[i].h.getBoundingClientRect().top <= 120) current = links[i];
      else break;
    }
    links.forEach(function (l) { l.a.classList.toggle("is-current", l === current); });
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  update();
})();
