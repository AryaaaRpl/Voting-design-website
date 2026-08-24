/* =============================================================================
   PARALLAX KIT — SMKS Muhammadiyah 1 Genteng
   -----------------------------------------------------------------------------
   Satu file untuk semua halaman. Butuh GSAP + ScrollTrigger sudah dimuat lebih
   dulu. Lenis opsional (kalau ada, dipakai; kalau tidak, tetap jalan).

   CARA PAKAI (di setiap halaman, sebelum </body>):
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
     <script src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js"></script>
     <script src="parallax-kit.js"></script>

   ATRIBUT HTML YANG DIKENALI:
     data-px-stage="light|dark|subtle|gold"   -> latar dekoratif otomatis
     data-parallax="0.25"                     -> geser elemen (+ searah, - lawan)
     data-scroll-reveal                       -> teks muncul kata demi kata
     data-px-depth                            -> kartu naik + skala saat masuk layar

   OVERRIDE (opsional, taruh SEBELUM script ini):
     <script>window.PX_CONFIG = { cards: '.fac-card, .misi-item' };</script>
============================================================================= */

(function () {
    'use strict';

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[parallax-kit] GSAP / ScrollTrigger belum dimuat. Kit dilewati.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var CFG = Object.assign({
        cards: '[data-px-depth]',
        smooth: true,
        headerParallax: true
    }, window.PX_CONFIG || {});

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------------
       1. STYLE — disuntik dari JS supaya halaman tidak perlu diedit CSS-nya
    --------------------------------------------------------------------- */
    var css = [
        ':root{--px-c1:6,78,59;--px-c2:217,119,6;}',
        '[data-parallax]{will-change:transform;}',
        '[data-px-stage]{position:relative;overflow:hidden;}',
        '[data-px-stage] > *:not(.px-stage){position:relative;z-index:2;}',
        '.px-stage{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;}',
        '.px-orb{position:absolute;border-radius:50%;filter:blur(70px);}',
        '.px-orb-1{background:radial-gradient(circle,rgba(var(--px-c1),.45) 0%,rgba(var(--px-c1),0) 70%);}',
        '.px-orb-2{background:radial-gradient(circle,rgba(var(--px-c2),.40) 0%,rgba(var(--px-c2),0) 70%);}',
        '.px-grid{position:absolute;inset:-25% -12%;background-image:' +
        'linear-gradient(to right,rgba(var(--px-c1),.07) 1px,transparent 1px),' +
        'linear-gradient(to bottom,rgba(var(--px-c1),.07) 1px,transparent 1px);' +
        'background-size:64px 64px;' +
        '-webkit-mask-image:radial-gradient(ellipse at center,#000 18%,transparent 72%);' +
        'mask-image:radial-gradient(ellipse at center,#000 18%,transparent 72%);}',
        '.px-stage-dark .px-grid{background-image:' +
        'linear-gradient(to right,rgba(255,255,255,.055) 1px,transparent 1px),' +
        'linear-gradient(to bottom,rgba(255,255,255,.055) 1px,transparent 1px);}',
        '.px-ring{position:absolute;border-radius:50%;border:1px solid rgba(var(--px-c1),.10);}',
        '.px-stage-dark .px-ring{border-color:rgba(255,255,255,.08);}',
        '.px-word{display:inline-block;opacity:.18;filter:blur(2px);transform:translateY(.12em);will-change:opacity,filter,transform;}',
        '@media(max-width:900px){.px-orb{opacity:.35;}.px-ring{display:none;}}',
        '@media(prefers-reduced-motion:reduce){.px-stage{display:none;}.px-word{opacity:1!important;filter:none!important;transform:none!important;}}'
    ].join('');

    var styleEl = document.createElement('style');
    styleEl.setAttribute('data-px-kit', '');
    styleEl.appendChild(document.createTextNode(css));
    document.head.appendChild(styleEl);

    /* ---------------------------------------------------------------------
       2. SMOOTH SCROLL (Lenis) — disinkronkan dengan ScrollTrigger
    --------------------------------------------------------------------- */
    var lenis = null;

    if (CFG.smooth && !reduced && typeof Lenis !== 'undefined' && !window.lenis) {
        lenis = new Lenis({
            duration: 1.2,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            smoothWheel: true,
            smoothTouch: false
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        window.lenis = lenis;

        // Anchor link -> scroll halus
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', function (e) {
                var id = this.getAttribute('href');
                if (!id || id.length < 2) return;
                var target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: -90, duration: 1.2 });
            });
        });

        // Modal membekukan body -> Lenis ikut berhenti, biar latar tidak ngesot
        var mo = new MutationObserver(function () {
            var locked = getComputedStyle(document.body).overflow === 'hidden';
            if (locked) { lenis.stop(); } else { lenis.start(); }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    } else if (window.lenis) {
        lenis = window.lenis;
    }

    /* ---------------------------------------------------------------------
       3. STAGE PRESETS — bikin lapisan dekoratif otomatis
    --------------------------------------------------------------------- */
    var PRESETS = {
        light: [
            { cls: 'px-grid', speed: 0.10, style: '' },
            { cls: 'px-orb px-orb-1', speed: 0.26, style: 'width:520px;height:520px;top:-150px;left:-130px;opacity:.5;' },
            { cls: 'px-orb px-orb-2', speed: -0.20, style: 'width:420px;height:420px;bottom:-160px;right:-110px;opacity:.45;' }
        ],
        dark: [
            { cls: 'px-grid', speed: 0.15, style: '' },
            { cls: 'px-ring', speed: 0.30, style: 'width:520px;height:520px;top:-180px;left:6%;' },
            { cls: 'px-ring', speed: -0.24, style: 'width:340px;height:340px;bottom:-140px;right:10%;' },
            { cls: 'px-orb px-orb-2', speed: 0.32, style: 'width:380px;height:380px;top:-120px;right:-90px;opacity:.5;' }
        ],
        gold: [
            { cls: 'px-grid', speed: 0.12, style: '' },
            { cls: 'px-orb px-orb-2', speed: 0.28, style: 'width:560px;height:560px;top:-180px;right:-150px;opacity:.5;' },
            { cls: 'px-ring', speed: -0.22, style: 'width:420px;height:420px;bottom:-180px;left:4%;' }
        ],
        subtle: [
            { cls: 'px-grid', speed: 0.08, style: '' },
            { cls: 'px-orb px-orb-1', speed: 0.18, style: 'width:460px;height:460px;top:8%;left:-190px;opacity:.28;' }
        ]
    };

    document.querySelectorAll('[data-px-stage]').forEach(function (host) {
        var preset = PRESETS[host.dataset.pxStage] || PRESETS.light;
        var stage = document.createElement('div');
        stage.className = 'px-stage' + (host.dataset.pxStage === 'dark' ? ' px-stage-dark' : '');
        stage.setAttribute('aria-hidden', 'true');

        preset.forEach(function (layer) {
            var el = document.createElement('div');
            el.className = layer.cls;
            el.setAttribute('style', layer.style);
            el.setAttribute('data-parallax', layer.speed);
            stage.appendChild(el);
        });

        host.insertBefore(stage, host.firstChild);
    });

    /* ---------------------------------------------------------------------
       4. MESIN PARALLAX — nilai = fraksi tinggi section, bukan piksel,
          jadi otomatis menyesuaikan ukuran layar
    --------------------------------------------------------------------- */
    if (!reduced) {
        document.querySelectorAll('[data-parallax]').forEach(function (layer) {
            var speed = parseFloat(layer.dataset.parallax) || 0;
            var trigger = layer.closest('[data-px-stage]') || layer.closest('section, header') || layer.parentElement;

            gsap.fromTo(layer,
                { yPercent: -speed * 50 },
                {
                    yPercent: speed * 50,
                    ease: 'none',
                    scrollTrigger: { trigger: trigger, start: 'top bottom', end: 'bottom top', scrub: 1 }
                }
            );
        });
    }

    /* ---------------------------------------------------------------------
       5. TEXT SCROLL REVEAL — kata demi kata, di-scrub scroll
    --------------------------------------------------------------------- */
    function splitWords(el) {
        if (el.dataset.pxSplit === 'true') return Array.prototype.slice.call(el.querySelectorAll('.px-word'));
        var words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        var frag = document.createDocumentFragment();
        words.forEach(function (w, i) {
            var s = document.createElement('span');
            s.className = 'px-word';
            s.textContent = w;
            frag.appendChild(s);
            if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        el.appendChild(frag);
        el.dataset.pxSplit = 'true';
        return Array.prototype.slice.call(el.querySelectorAll('.px-word'));
    }

    document.querySelectorAll('[data-scroll-reveal]').forEach(function (el) {
        var words = splitWords(el);
        if (reduced) return;
        gsap.to(words, {
            opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: 0.6,
            scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: 0.8 }
        });
    });

    /* ---------------------------------------------------------------------
       6. DEPTH REVEAL untuk kartu
    --------------------------------------------------------------------- */
    if (!reduced && CFG.cards) {
        var cards = document.querySelectorAll(CFG.cards);
        if (cards.length) {
            ScrollTrigger.batch(cards, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 44, scale: 0.97 },
                        {
                            opacity: 1, y: 0, scale: 1, duration: 0.75,
                            stagger: 0.09, ease: 'power3.out', clearProps: 'transform'
                        }
                    );
                }
            });
        }
    }

    /* ---------------------------------------------------------------------
       7. PAGE HEADER — judul naik pelan + memudar saat halaman di-scroll
    --------------------------------------------------------------------- */
    if (!reduced && CFG.headerParallax) {
        var header = document.querySelector('.page-header');
        if (header) {
            var inner = header.querySelector('.container');
            if (inner) {
                gsap.to(inner, {
                    yPercent: -14,
                    opacity: 0.25,
                    ease: 'none',
                    scrollTrigger: { trigger: header, start: 'top top', end: 'bottom top', scrub: 0.6 }
                });
            }
        }
    }

    /* ---------------------------------------------------------------------
       8. REFRESH — font & gambar sering selesai memuat setelah layout dihitung
    --------------------------------------------------------------------- */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
})();