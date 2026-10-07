/* Chamuditha Jayasanka — portfolio interactions */
(function () {
    "use strict";

    var docEl = document.documentElement;

    /* Google Sheet endpoint — paste your Apps Script Web app URL here */
    var SCRIPT_URL = "";

    /* ---------- theme ---------- */
    var themeToggle = document.getElementById("themeToggle");

    function syncThemeButton() {
        if (!themeToggle) return;
        var isDark = docEl.dataset.theme !== "light";
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light theme" : "Switch to dark theme"
        );
    }

    syncThemeButton();

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            var next = docEl.dataset.theme === "light" ? "dark" : "light";
            docEl.dataset.theme = next;
            try {
                localStorage.setItem("theme", next);
            } catch (e) {}
            syncThemeButton();
        });
    }

    window
        .matchMedia("(prefers-color-scheme: light)")
        .addEventListener("change", function (e) {
            var saved = null;
            try {
                saved = localStorage.getItem("theme");
            } catch (err) {}
            if (saved) return;
            docEl.dataset.theme = e.matches ? "light" : "dark";
            syncThemeButton();
        });

    /* ---------- mobile nav ---------- */
    var navToggle = document.getElementById("navToggle");
    var navList = document.getElementById("primaryNav");

    function setMenu(open) {
        if (!navToggle || !navList) return;
        navList.classList.toggle("open", open);
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (navToggle) {
        navToggle.addEventListener("click", function () {
            setMenu(navToggle.getAttribute("aria-expanded") !== "true");
        });
    }

    navList.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 860) setMenu(false);
    });

    /* ---------- header shadow + scroll spy ---------- */
    var header = document.getElementById("siteHeader");
    var sections = Array.prototype.slice.call(
        document.querySelectorAll("main section[id]")
    );
    var navAnchors = Array.prototype.slice.call(
        document.querySelectorAll(".nav-link")
    );

    /* Browsers ignore a click on the link for the section you are already
       on — force a smooth scroll so every nav click responds. */
    navAnchors.forEach(function (link) {
        link.addEventListener("click", function () {
            var target = document.querySelector(link.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    function onScroll() {
        if (header) header.classList.toggle("scrolled", window.scrollY > 8);

        var probe = window.scrollY + (window.innerHeight * 0.32);
        var currentId = null;

        sections.forEach(function (section) {
            if (section.offsetTop <= probe) currentId = section.id;
        });

        if (
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 4
        ) {
            currentId = sections.length
                ? sections[sections.length - 1].id
                : currentId;
        }

        navAnchors.forEach(function (link) {
            var match =
                currentId !== null &&
                link.getAttribute("href") === "#" + currentId;
            link.classList.toggle("active", match);
            if (match) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    var lastRun = 0;
    window.addEventListener(
        "scroll",
        function () {
            /* Throttled by timestamp rather than requestAnimationFrame: rAF is
               not delivered in background tabs, which would freeze the spy. */
            var now = Date.now();
            if (now - lastRun < 80) return;
            lastRun = now;
            onScroll();
        },
        { passive: true }
    );
    window.addEventListener("resize", onScroll);
    onScroll();

    /* ---------- reveal on scroll ---------- */
    var revealEls = Array.prototype.slice.call(
        document.querySelectorAll(".reveal")
    );

    if ("IntersectionObserver" in window) {
        var revealedAny = false;

        var revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var el = entry.target;
                    var delay = Number(el.dataset.revealDelay || 0);
                    window.setTimeout(function () {
                        el.classList.add("visible");
                    }, delay);
                    revealedAny = true;
                    revealObserver.unobserve(el);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );

        revealEls.forEach(function (el, i) {
            el.dataset.revealDelay = String((i % 4) * 70);
            revealObserver.observe(el);
        });

        /* Failsafe: never leave content permanently hidden if the observer
           is not delivered (some embedded/throttled engines skip it). */
        window.setTimeout(function () {
            if (revealedAny) return;
            revealEls.forEach(function (el) {
                el.classList.add("visible");
            });
        }, 2500);
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("visible");
        });
    }

    /* ---------- glass spotlight (cursor-following highlight) ---------- */
    if (window.matchMedia("(hover: hover)").matches) {
        document.querySelectorAll(".card, .bento, .stack-card, .demo-card").forEach(function (card) {
            card.addEventListener("pointermove", function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty("--mx", e.clientX - r.left + "px");
                card.style.setProperty("--my", e.clientY - r.top + "px");
            });
        });
    }

    /* ---------- seamless marquee ---------- */
    var marqueeTrack = document.querySelector(".marquee-track");
    if (marqueeTrack) {
        marqueeTrack.innerHTML += marqueeTrack.innerHTML;
    }

    /* ---------- contact form ---------- */
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");

    function setError(input, message) {
        var field = input.closest(".field");
        if (!field) return;
        field.classList.toggle("invalid", Boolean(message));
        var slot = field.querySelector(".error");
        if (slot) slot.textContent = message || "";
    }

    function validate(input) {
        var value = input.value.trim();

        if (input.hasAttribute("required") && !value) {
            setError(input, "This field is required.");
            return false;
        }

        if (input.type === "email" && value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                setError(input, "Enter a valid email address.");
                return false;
            }
        }

        setError(input, "");
        return true;
    }

    if (form) {
        var inputs = Array.prototype.slice.call(
            form.querySelectorAll("input, textarea")
        );

        inputs.forEach(function (input) {
            input.addEventListener("blur", function () {
                if (input.value.trim() || input.hasAttribute("required")) {
                    validate(input);
                }
            });
            input.addEventListener("input", function () {
                if (input.closest(".field").classList.contains("invalid")) {
                    validate(input);
                }
            });
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var ok = true;
            var firstBad = null;

            inputs.forEach(function (input) {
                if (!validate(input) && ok) {
                    ok = false;
                    firstBad = input;
                }
            });

            if (!ok) {
                if (status) status.textContent = "Please fix the highlighted fields.";
                if (firstBad) firstBad.focus();
                return;
            }

            var payload = {
                name: (form.elements.name.value || "").trim(),
                email: (form.elements.email.value || "").trim(),
                subject: (form.elements.subject.value || "").trim(),
                message: (form.elements.message.value || "").trim()
            };

            if (!SCRIPT_URL) {
                if (status) status.textContent = "Form not configured yet — add SCRIPT_URL in script.js.";
                return;
            }

            var btn = document.getElementById("submitBtn");
            if (btn) btn.disabled = true;
            if (status) status.textContent = "Sending…";

            fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            })
                .catch(function () {})
                .then(function () {
                    form.reset();
                    if (status) status.textContent = "Thanks — I'll get back to you soon.";
                })
                .finally(function () {
                    if (btn) btn.disabled = false;
                });
        });
    }

    /* ---------- footer year ---------- */
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
})();
