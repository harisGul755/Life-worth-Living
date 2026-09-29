document.addEventListener('DOMContentLoaded', () => {
  // Reveal-on-scroll fade for plain content sections.
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Nav logo draws in proportion to page scroll progress. Plain
  // scroll listener, reads position only, never sets it.
  const navPath = document.querySelector('.nav-logo-path');
  if (navPath) {
    const length = navPath.getTotalLength();
    navPath.style.strokeDasharray = length;
    function updateNavLogo() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      navPath.style.strokeDashoffset = length * (1 - p);
    }
    window.addEventListener('scroll', updateNavLogo, { passive: true });
    window.addEventListener('resize', updateNavLogo);
    updateNavLogo();
  }

  // Mobile menu toggle
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      menuBtn.classList.toggle('is-open', isOpen);
      menuBtn.innerHTML = isOpen ? '&#10005;' : '&#9776;';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        menuBtn.classList.remove('is-open');
        menuBtn.innerHTML = '&#9776;';
      });
    });
  }
});

// --- GSAP scroll effects ---
// Runs on window "load" (simple, guaranteed to fire) rather than
// waiting on font-load promises, then refreshes again shortly after
// to correct for any late font reflow. ScrollTrigger.matchMedia
// handles the desktop/mobile split internally and re-evaluates
// automatically on resize, which is more reliable than a one-time
// boolean check computed by hand.
window.addEventListener('load', () => {
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({

    // ---------- DESKTOP: pinned scroll-jacking effects ----------
    '(min-width: 861px)': function () {
      ScrollTrigger.normalizeScroll(true);

      const heroSection = document.querySelector('.hero');
      const drawLines = document.querySelectorAll('.draw-line');
      if (heroSection && drawLines.length) {
        drawLines.forEach(p => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        ScrollTrigger.create({
          trigger: heroSection, start: 'top top', end: '+=700',
          pin: true, scrub: 1, anticipatePin: 1,
          animation: gsap.to(drawLines, { strokeDashoffset: 0, ease: 'none', stagger: 0.06 })
        });
      }

      const blurTitle = document.querySelector('.services-head h2');
      if (blurTitle) {
        blurTitle.classList.add('blur-title');
        gsap.fromTo(blurTitle,
          { filter: 'blur(14px)', opacity: 0.25 },
          {
            filter: 'blur(0px)', opacity: 1, ease: 'none',
            scrollTrigger: { trigger: blurTitle, start: 'top 85%', end: 'top 40%', scrub: true }
          }
        );
      }

      const soloSlides = document.querySelectorAll('.provider-solo');
      const providersPin = document.querySelector('.providers-pin');
      const progressEl = document.querySelector('.providers-progress');
      if (soloSlides.length && providersPin) {
        const n = soloSlides.length;
        const perSlide = 420;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: providersPin, start: 'top top',
            end: '+=' + (perSlide * (n - 1)),
            pin: true, scrub: 1, anticipatePin: 1,
            onUpdate: self => {
              if (progressEl) progressEl.textContent = (Math.round(self.progress * (n - 1)) + 1) + ' / ' + n;
            }
          }
        });
        const holdStart = 0.6, transitionDuration = 0.4;
        for (let i = 1; i < n; i++) {
          tl.to(soloSlides[i - 1], { opacity: 0, filter: 'blur(14px)', duration: transitionDuration }, (i - 1) + holdStart)
            .to(soloSlides[i], { opacity: 1, filter: 'blur(0px)', duration: transitionDuration }, (i - 1) + holdStart);
        }
      }

      const approachSection = document.querySelector('.approach');
      const approachLines = document.querySelectorAll('.approach-draw-line');
      if (approachSection && approachLines.length) {
        approachLines.forEach(p => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        ScrollTrigger.create({
          trigger: approachSection, start: 'top top', end: '+=500',
          pin: true, scrub: 1, anticipatePin: 1,
          animation: gsap.to(approachLines, { strokeDashoffset: 0, ease: 'none', stagger: 0.06 })
        });
      }
    },

    // ---------- MOBILE: same content, no pinning ----------
    '(max-width: 860px)': function () {
      const drawLines = document.querySelectorAll('.draw-line, .approach-draw-line');
      drawLines.forEach(p => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      document.querySelectorAll('.hero, .approach').forEach(section => {
        const lines = section.querySelectorAll('.draw-line, .approach-draw-line');
        if (!lines.length) return;
        gsap.to(lines, {
          strokeDashoffset: 0, ease: 'none', stagger: 0.06,
          scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 25%', scrub: 1 }
        });
      });

      const blurTitle = document.querySelector('.services-head h2');
      if (blurTitle) {
        blurTitle.classList.add('blur-title');
        gsap.fromTo(blurTitle,
          { filter: 'blur(14px)', opacity: 0.25 },
          {
            filter: 'blur(0px)', opacity: 1, ease: 'none',
            scrollTrigger: { trigger: blurTitle, start: 'top 90%', end: 'top 55%', scrub: true }
          }
        );
      }
      // Provider cards are a plain stacked list on mobile via CSS
      // (see style.css) - nothing to pin or animate here.
    }
  });

  ScrollTrigger.refresh();
  setTimeout(() => ScrollTrigger.refresh(), 400); // catch late font reflow
});
