/* ==========================================================================
   TCG — Studio visuel
   Interactions & motion
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
     Preloader
     ------------------------------------------------------------------------ */
  const preloader = $('#preloader');
  const loaderCount = $('#loader-count');
  const loaderBar = $('#loader-bar');

  let progress = 0;
  let loaderDone = false;

  const setProgress = (value) => {
    progress = Math.min(100, Math.max(progress, Math.round(value)));
    if (loaderCount) loaderCount.textContent = String(progress).padStart(2, '0');
    if (loaderBar) loaderBar.style.transform = `scaleX(${progress / 100})`;
  };

  const finishLoader = () => {
    if (loaderDone) return;
    loaderDone = true;
    setProgress(100);
    setTimeout(() => {
      document.body.classList.add('is-ready');
      if (preloader) preloader.classList.add('is-done');
      setTimeout(() => { if (preloader) preloader.remove(); }, 1400);
      initAfterLoad();
    }, 380);
  };

  if (reduceMotion) {
    if (preloader) preloader.remove();
    document.body.classList.add('is-ready');
    const heroVideoEl = $('#hero-video');
    if (heroVideoEl) {
      heroVideoEl.removeAttribute('autoplay');
      heroVideoEl.pause();
    }
    initAfterLoad();
  } else {
    let fake = 0;
    const tick = setInterval(() => {
      fake += (88 - fake) * 0.06;
      setProgress(fake);
    }, 60);

    const onReady = () => {
      clearInterval(tick);
      setProgress(100);
      setTimeout(finishLoader, 220);
    };

    if (document.readyState === 'complete') {
      setTimeout(onReady, 500);
    } else {
      window.addEventListener('load', () => setTimeout(onReady, 300), { once: true });
      setTimeout(onReady, 4200); // safety net
    }
  }

  /* ------------------------------------------------------------------------
     Smooth scrolling
     ------------------------------------------------------------------------ */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenis.on('scroll', onScroll);
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const headerOffset = () => {
    if (!header) return 0;
    return header.offsetHeight + 16;
  };

  const scrollTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const offset = el.id === 'top' || el === document.body ? 0 : headerOffset();
    if (lenis) lenis.scrollTo(el, { offset: -offset, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const lockScroll = (lock) => {
    document.body.classList.toggle('is-locked', lock);
    if (lenis) lock ? lenis.stop() : lenis.start();
  };

  /* ------------------------------------------------------------------------
     Scroll state: header, progress bar, parallax, hero video
     ------------------------------------------------------------------------ */
  const header = $('#header');
  const progressBar = $('#scroll-progress');
  const hero = $('.hero');
  const heroVideo = $('#hero-video');
  const tickerTrack = $('.ticker__track');
  let tickerSpeed = 0;
  let tickerRaf = null;

  function updateTickerVelocity(y) {
    if (reduceMotion || !tickerTrack) return;
    const delta = Math.abs(y - lastY);
    if (!delta) return;
    tickerSpeed = Math.min(70, tickerSpeed + delta * 1.6);
    if (!tickerRaf) {
      tickerRaf = requestAnimationFrame(function decay() {
        tickerSpeed *= 0.92;
        const boost = Math.max(14, 34 / (1 + tickerSpeed / 34));
        tickerTrack.style.animationDuration = `${boost.toFixed(2)}s`;
        if (tickerSpeed > 0.6) {
          tickerRaf = requestAnimationFrame(decay);
        } else {
          tickerTrack.style.animationDuration = '34s';
          tickerRaf = null;
        }
      });
    }
  }
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docH > 0 ? y / docH : 0;

      if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;

      const heroH = hero ? hero.offsetHeight : window.innerHeight;
      const headerHeight = header ? header.offsetHeight : 80;

      if (header) {
        const overDark = (() => {
          const probeY = headerHeight + Math.min(120, window.innerHeight * 0.14);
          const probe = document.elementFromPoint(window.innerWidth / 2, probeY);
          if (!probe) return false;
          return !!probe.closest('.film, .contact, .hero');
        })();

        const menuOpen = document.body.classList.contains('menu-open');

        if (menuOpen) {
          header.classList.add('is-menu');
          header.classList.remove('is-light');
        } else {
          header.classList.remove('is-menu');
          header.classList.toggle('is-light', y > heroH - headerHeight - 40 && !overDark);
        }

        header.classList.toggle('is-condensed', y > heroH * 0.9);
        header.classList.remove('is-hidden');

        if (header.classList.contains('is-light')) {
          const pill = header.querySelector('.header__cta');
          if (pill) {
            const cs = getComputedStyle(pill);
            pill.style.opacity = '';
            pill.style.transform = '';
            void cs.opacity;
          }
        }
      }

      if (!reduceMotion && hero && heroVideo) {
        const p = Math.min(y / heroH, 1);
        if (p <= 1.05) {
          heroVideo.style.transform = `scale(${(1.06 + p * 0.06).toFixed(4)}) translateY(${(p * 4).toFixed(2)}%)`;
        }
      }

      updateParallax();
      updateTickerVelocity(y);
      lastY = y;
      ticking = false;
    });
  }

  // hero video: pause when out of view to save ressources
  if (hero && heroVideo) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (heroVideo.paused) heroVideo.play().catch(() => {});
      } else if (!heroVideo.paused) {
        heroVideo.pause();
      }
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  /* ------------------------------------------------------------------------
     Parallax
     ------------------------------------------------------------------------ */
  const parallaxEls = $$('.parallax');
  function updateParallax() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue;
      const center = r.top + r.height / 2;
      const delta = (center - vh / 2) / vh;
      const amp = el.closest('.gallery__btn') ? 26 : el.closest('.about__img') ? 18 : 34;
      el.style.transform = `translate3d(0, ${(-delta * amp).toFixed(2)}px, 0)`;
    }
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------------------
     Custom cursor
     ------------------------------------------------------------------------ */
  const cursor = $('#cursor');
  if (cursor && finePointer && !reduceMotion) {
    const label = document.createElement('span');
    label.className = 'cursor__label';
    cursor.appendChild(label);

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.classList.add('is-active');
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));

    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const hoverables = $$('a, button');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const text = el.dataset.cursor || '';
        if (text) {
          label.textContent = text;
          cursor.classList.add('is-hover');
        } else {
          cursor.classList.add('is-link');
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hover', 'is-link');
        label.textContent = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     Magnetic elements
     ------------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 0.24;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     Clock — Paris
     ------------------------------------------------------------------------ */
  const timeEls = $$('[data-time]');
  const updateClock = () => {
    const time = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
    timeEls.forEach((el) => { el.textContent = time; });
  };
  if (timeEls.length) {
    updateClock();
    setInterval(updateClock, 20000);
  }

  /* ------------------------------------------------------------------------
     Counters
     ------------------------------------------------------------------------ */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const pad = Number(el.dataset.pad || 0);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const value = Math.round(target * eased);
          el.textContent = String(value).padStart(pad, '0') + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      }
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */
  const burger = $('#burger');
  const menu = $('#menu');
  const menuLinks = $$('.menu__nav a, .menu__foot a');

  const setMenu = (open) => {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    lockScroll(open);
    if (header) {
      header.classList.toggle('is-menu', open);
      if (open) header.classList.remove('is-hidden');
    }
  };

  if (burger) {
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  }
  menuLinks.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     Smooth anchor links
     ------------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    a.addEventListener('click', (e) => {
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (menu && menu.classList.contains('is-open')) setMenu(false);
      setTimeout(() => scrollTo(target), menu && menu.classList.contains('is-open') ? 260 : 0);
    });
  });

  const topBtn = $('[data-top]');
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     Film modal
     ------------------------------------------------------------------------ */
  const filmModal = $('#film-modal');
  const filmVideo = $('#film-video');
  let videoLoaded = false;

  const openFilm = () => {
    if (!filmModal || !filmVideo) return;
    if (!videoLoaded) {
      const source = filmVideo.querySelector('source[data-src]');
      if (source) {
        source.src = source.dataset.src;
        filmVideo.load();
      }
      videoLoaded = true;
    }
    filmModal.classList.add('is-open');
    filmModal.setAttribute('aria-hidden', 'false');
    filmModal.inert = false;
    lockScroll(true);
    const playPromise = filmVideo.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => {});
    setTimeout(() => $('.modal__close')?.focus(), 400);
  };

  const closeFilm = () => {
    if (!filmModal) return;
    filmModal.classList.remove('is-open');
    filmModal.setAttribute('aria-hidden', 'true');
    filmModal.inert = true;
    lockScroll(false);
    if (filmVideo) {
      filmVideo.pause();
      try { filmVideo.currentTime = 0; } catch (_) { /* noop */ }
    }
  };

  $$('[data-open-film]').forEach((btn) => btn.addEventListener('click', openFilm));
  $$('[data-close-film]').forEach((btn) => btn.addEventListener('click', closeFilm));
  if (filmModal) {
    filmModal.addEventListener('click', (e) => {
      if (e.target === filmModal) closeFilm();
    });
  }

  /* ------------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------------ */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxCaption = $('#lightbox-caption');
  const lightboxCount = $('#lightbox-count');

  const lightboxEls = $$('[data-lightbox]');
  const groups = new Map();

  lightboxEls.forEach((el) => {
    const key = el.dataset.lightboxGroup || 'default';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      el,
      full: el.dataset.full,
      caption: el.dataset.caption || '',
      alt: (el.querySelector('img') && el.querySelector('img').alt) || '',
    });
  });

  let items = [];
  let currentIndex = 0;
  let lightboxOpen = false;

  // Serve a lighter file to small screens in the lightbox
  const fullSource = (src) => {
    if (!src) return src;
    if (window.innerWidth > 900) return src;
    return src
      .replace(/-1800\.webp$/, '-1200.webp')
      .replace(/-1600\.webp$/, '-900.webp');
  };

  const renderSlide = (index) => {
    if (!lightboxImg || !items.length) return;
    const total = items.length;
    currentIndex = ((index % total) + total) % total;
    const item = items[currentIndex];

    lightboxImg.classList.remove('is-loaded');
    lightboxImg.alt = item.alt;

    const source = fullSource(item.full);
    const preload = new Image();
    preload.onload = () => {
      lightboxImg.src = source;
      requestAnimationFrame(() => lightboxImg.classList.add('is-loaded'));
    };
    preload.onerror = () => {
      lightboxImg.src = item.full;
      lightboxImg.classList.add('is-loaded');
    };
    preload.src = source;

    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCount) {
      lightboxCount.textContent =
        `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    const multiple = total > 1;
    if (prevBtn) prevBtn.style.display = multiple ? '' : 'none';
    if (nextBtn) nextBtn.style.display = multiple ? '' : 'none';
  };

  const openLightbox = (el) => {
    if (!lightbox) return;
    const key = el.dataset.lightboxGroup || 'default';
    items = groups.get(key) || [];
    const index = items.findIndex((item) => item.el === el);
    lightboxOpen = true;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.inert = false;
    renderSlide(index < 0 ? 0 : index);
    lockScroll(true);
    setTimeout(() => $('.lightbox__close')?.focus(), 350);
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightboxOpen = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.inert = true;
    lockScroll(false);
  };

  lightboxEls.forEach((el) => {
    el.addEventListener('click', () => openLightbox(el));
  });

  $$('[data-close-lightbox]').forEach((b) => b.addEventListener('click', closeLightbox));
  const prevBtn = $('[data-prev]');
  const nextBtn = $('[data-next]');
  if (prevBtn) prevBtn.addEventListener('click', () => renderSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => renderSlide(currentIndex + 1));
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') renderSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') renderSlide(currentIndex + 1);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filmModal && filmModal.classList.contains('is-open')) closeFilm();
  });

  // basic swipe for lightbox
  let touchStartX = 0;
  let touchStartY = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        renderSlide(currentIndex + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Hover preview for project rows
     ------------------------------------------------------------------------ */
  const preview = $('#work-preview');
  if (preview && finePointer && !reduceMotion) {
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let tx = px;
    let ty = py;
    let currentSrc = '';

    const loop = () => {
      px += (tx - px) * 0.16;
      py += (ty - py) * 0.16;
      preview.style.transform = `translate3d(${px + 62}px, ${py}px, 0) translateY(-50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.addEventListener('mousemove', (e) => {
      const row = e.target instanceof Element ? e.target.closest('.work__row') : null;
      const src = row ? row.dataset.preview : '';

      if (!src) {
        if (currentSrc) {
          currentSrc = '';
          preview.style.opacity = '0';
        }
        return;
      }

      if (src !== currentSrc) {
        currentSrc = src;
        preview.innerHTML = `<img src="${src}" alt="" aria-hidden="true">`;
        preview.style.opacity = '1';
      }
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      currentSrc = '';
      preview.style.opacity = '0';
    });
  }

  /* ------------------------------------------------------------------------
     After load
     ------------------------------------------------------------------------ */
  function initAfterLoad() {
    onScroll();
    updateParallax();
  }

  // Keep parallax accurate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateParallax();
      onScroll();
    }, 150);
  });
})();
