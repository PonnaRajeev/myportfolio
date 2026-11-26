/* ==========================================================================
   Portfolio interactions
   - theme toggle (persisted, respects OS preference)
   - mobile navigation
   - project filtering
   - animated stat counters
   - reveal-on-scroll
   - contact form validation
   - scroll spy for the active nav link
   ========================================================================== */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Theme
     ---------------------------------------------------------------------- */
  const THEME_KEY = "portfolio-theme";
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-toggle__icon");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "\u2600" : "\u263D";
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* storage unavailable (private mode) - theme still applies for this session */
    }
  }

  const storedTheme = readStoredTheme();
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(storedTheme || (systemPrefersDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("nav-menu");

  function closeNav() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!navMenu.classList.contains("is-open")) return;
      if (event.target.closest(".nav")) return;
      closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeNav();
    });
  }

  /* ----------------------------------------------------------------------
     Project filtering
     ---------------------------------------------------------------------- */
  const filterButtons = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".card"));
  const emptyState = document.getElementById("empty-state");

  function applyFilter(filter) {
    let visibleCount = 0;

    cards.forEach(function (card) {
      const tags = (card.dataset.tags || "").split(/\s+/);
      const matches = filter === "all" || tags.includes(filter);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (other) {
        const isActive = other === button;
        other.classList.toggle("is-active", isActive);
        other.setAttribute("aria-pressed", String(isActive));
      });
      applyFilter(button.dataset.filter);
    });
  });

  /* ----------------------------------------------------------------------
     Animated counters
     ---------------------------------------------------------------------- */
  function animateCount(element) {
    const target = Number(element.dataset.countTo);
    const suffix = element.dataset.suffix || "";
    if (!Number.isFinite(target)) return;

    function render(value) {
      element.textContent = String(value) + suffix;
    }

    if (prefersReducedMotion) {
      render(target);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      render(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------------------
     Reveal on scroll (also drives the counters)
     ---------------------------------------------------------------------- */
  const revealTargets = Array.from(
    document.querySelectorAll(".card, .hero__stats, .contact__form, .skill-group, .timeline__item")
  );
  revealTargets.forEach(function (element) {
    element.classList.add("reveal");
  });

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach(function (element) {
      element.classList.add("is-visible");
    });
    document.querySelectorAll("[data-count-to]").forEach(animateCount);
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");

          entry.target.querySelectorAll("[data-count-to]").forEach(animateCount);
          if (entry.target.hasAttribute("data-count-to")) animateCount(entry.target);

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach(function (element) {
      observer.observe(element);
    });

    const statsBlock = document.querySelector(".hero__stats");
    if (statsBlock) observer.observe(statsBlock);
  }

  /* ----------------------------------------------------------------------
     Scroll spy
     ---------------------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav__menu a[href^="#"]'));
  const spySections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function updateActiveLink() {
    const probe = window.scrollY + window.innerHeight * 0.3;
    let current = spySections[0];

    spySections.forEach(function (section) {
      if (section.offsetTop <= probe) current = section;
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("is-current", current && link.getAttribute("href") === "#" + current.id);
    });
  }

  if (spySections.length) {
    let scrollScheduled = false;
    window.addEventListener(
      "scroll",
      function () {
        if (scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(function () {
          updateActiveLink();
          scrollScheduled = false;
        });
      },
      { passive: true }
    );
    updateActiveLink();
  }

  /* ----------------------------------------------------------------------
     Contact form
     ---------------------------------------------------------------------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(input, message) {
    const errorEl = document.getElementById(input.id + "-error");
    const hasError = Boolean(message);

    input.setAttribute("aria-invalid", String(hasError));
    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.hidden = !hasError;
    }
  }

  function validateField(input) {
    const value = input.value.trim();

    if (input.id === "name") {
      if (!value) return "Please tell me your name.";
      if (value.length < 2) return "That name looks a little short.";
    }

    if (input.id === "email") {
      if (!value) return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address.";
    }

    if (input.id === "message") {
      if (!value) return "Please add a short message.";
      if (value.length < 10) return "Could you add a little more detail? (10+ characters)";
    }

    return "";
  }

  if (form) {
    const fields = Array.from(form.querySelectorAll("input, textarea")).filter(function (input) {
      return input.type !== "hidden" && input.id !== "_gotcha";
    });
    const submitButton = form.querySelector('button[type="submit"]');

    fields.forEach(function (input) {
      input.addEventListener("blur", function () {
        setFieldError(input, validateField(input));
      });

      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") {
          setFieldError(input, validateField(input));
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      let firstInvalid = null;
      fields.forEach(function (input) {
        const message = validateField(input);
        setFieldError(input, message);
        if (message && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        if (status) {
          status.textContent = "Please fix the highlighted fields.";
          status.style.color = "";
        }
        firstInvalid.focus();
        return;
      }

      if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
        if (status) {
          status.textContent =
            "Form is not configured yet - add your Formspree form ID to the form action.";
          status.style.color = "";
        }
        return;
      }

      const name = form.elements.name.value.trim();
      const originalLabel = submitButton ? submitButton.textContent : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending\u2026";
      }
      if (status) {
        status.textContent = "Sending your message\u2026";
        status.style.color = "";
      }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Formspree responded with " + response.status);
          if (status) {
            status.textContent = "Thanks, " + name + "! Your message has been sent.";
            status.style.color = "";
          }
          form.reset();
          fields.forEach(function (input) {
            setFieldError(input, "");
          });
        })
        .catch(function () {
          if (status) {
            status.textContent =
              "Sorry, something went wrong. Please try again in a moment.";
            status.style.color = "#dc2626";
          }
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalLabel;
          }
        });
    });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
